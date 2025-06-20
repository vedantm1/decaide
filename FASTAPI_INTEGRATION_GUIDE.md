# FastAPI Integration Guide for DecA(I)de

This document provides a comprehensive guide on how to integrate the DecA(I)de platform with a FastAPI backend for use in external systems.

## Table of Contents

1. [Overview](#overview)
2. [Setting Up FastAPI](#setting-up-fastapi)
3. [Authentication Integration](#authentication-integration)
4. [API Route Implementation](#api-route-implementation)
5. [API Client Utilities](#api-client-utilities)
6. [Sample Integration Code](#sample-integration-code)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

This guide explains how to build a FastAPI backend that connects to and leverages the DecA(I)de platform APIs. The integration enables your application to access AI-powered DECA competition preparation features, including:

- Roleplay scenario generation
- Practice test generation
- Written event feedback
- Performance indicator explanations
- Diego chat assistant

## Setting Up FastAPI

### 1. Install Required Packages

```bash
pip install fastapi uvicorn httpx python-dotenv pydantic python-multipart
```

### 2. Project Structure

Create the following project structure:

```
fastapi_decade_integration/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI application
│   ├── api/
│   │   ├── __init__.py
│   │   ├── endpoints/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py      # Auth routing
│   │   │   ├── ai.py        # AI feature routing
│   │   │   ├── chat.py      # Chat feature routing
│   │   │   └── data.py      # Data access routing
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py       # App configuration
│   │   └── security.py     # Authentication helpers
│   ├── clients/
│   │   ├── __init__.py
│   │   └── decade_client.py # Client for DecA(I)de APIs
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py         # User models
│   │   ├── ai.py           # AI feature models
│   │   └── chat.py         # Chat models
│   └── utils/
│       ├── __init__.py
│       └── session.py      # Session management
├── .env                   # Environment variables
└── requirements.txt       # Dependencies
```

### 3. Environment Configuration

Create a `.env` file with the following variables:

```
# DecA(I)de API Configuration
DECADE_API_BASE_URL=https://your-decade-instance.com
DECADE_API_SECRET=your_shared_secret_for_service_authentication

# Your FastAPI Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true
SECRET_KEY=your_fastapi_secret_key

# Optional: Azure OpenAI direct access
AZURE_OPENAI_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
AZURE_OPENAI_DEPLOYMENT=your_deployment_name
```

### 4. Create FastAPI Application

Create the `app/main.py` file:

```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import auth, ai, chat, data
from app.core.config import settings

app = FastAPI(
    title="DecA(I)de Integration API",
    description="FastAPI integration with DecA(I)de's AI educational platform",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(ai.router, prefix="/ai", tags=["ai-features"])
app.include_router(chat.router, prefix="/chat", tags=["chat-features"])
app.include_router(data.router, prefix="/data", tags=["data-access"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.API_HOST, port=settings.API_PORT, reload=settings.DEBUG)
```

### 5. Configuration File

Create the `app/core/config.py` file:

```python
from pydantic import BaseSettings
from typing import List

class Settings(BaseSettings):
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = False
    SECRET_KEY: str

    # DecA(I)de API settings
    DECADE_API_BASE_URL: str
    DECADE_API_SECRET: str

    # CORS settings
    CORS_ORIGINS: List[str] = ["*"]

    # Optional direct Azure OpenAI settings
    AZURE_OPENAI_KEY: str = None
    AZURE_OPENAI_ENDPOINT: str = None
    AZURE_OPENAI_DEPLOYMENT: str = None

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

## Authentication Integration

### 1. Authentication Models

Create `app/models/user.py`:

```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any

class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    
class UserCreate(UserBase):
    password: str
    eventFormat: Optional[str] = None
    eventCode: Optional[str] = None
    eventType: Optional[str] = None
    instructionalArea: Optional[str] = None
    
class UserLogin(BaseModel):
    username: str
    password: str
    
class UserResponse(UserBase):
    id: int
    subscription_tier: str = Field(default="standard")
    ui_theme: str = Field(default="aquaBlue")
    color_scheme: str = Field(default="memphis")
    theme: str = Field(default="light")
    points: int = 0
    
    class Config:
        orm_mode = True
        
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
```

### 2. Authentication Endpoints

Create `app/api/endpoints/auth.py`:

```python
from fastapi import APIRouter, HTTPException, Depends, Response, Cookie
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from app.clients.decade_client import DecadeClient
from app.models.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.core.security import create_session_token, validate_session

router = APIRouter()
decade_client = DecadeClient()

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Register a new user in the DecA(I)de system"""
    try:
        user = await decade_client.register_user(
            username=user_data.username,
            password=user_data.password,
            email=user_data.email,
            event_format=user_data.eventFormat,
            event_code=user_data.eventCode,
            event_type=user_data.eventType,
            instructional_area=user_data.instructionalArea
        )
        return user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, response: Response):
    """Login to the DecA(I)de system and get a session token"""
    try:
        session_data = await decade_client.login_user(
            username=user_data.username,
            password=user_data.password
        )
        
        # Create a session token for your FastAPI service
        token = create_session_token(session_data)
        
        # Set the DecA(I)de session cookie for future requests
        response.set_cookie(
            key="decade_session",
            value=session_data.get("session_id"),
            httponly=True,
            secure=True,
            samesite="strict"
        )
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": session_data.get("user")
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

@router.post("/logout")
async def logout(response: Response, decade_session: str = Cookie(None)):
    """Logout from the DecA(I)de system"""
    try:
        if decade_session:
            await decade_client.logout_user(decade_session)
        
        # Clear cookies
        response.delete_cookie(key="decade_session")
        return {"message": "Logout successful"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user = Depends(validate_session)):
    """Get the current authenticated user"""
    return current_user
```

## API Route Implementation

### 1. AI Features Integration

Create `app/models/ai.py`:

```python
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class RoleplayRequest(BaseModel):
    instructional_area: str
    performance_indicators: List[str]
    difficulty_level: str
    business_type: Optional[str] = None

class TestRequest(BaseModel):
    test_type: str
    categories: List[str]
    num_questions: int

class WrittenFeedbackRequest(BaseModel):
    event_type: str
    content: str
    sections: Optional[Dict[str, str]] = None

class RoleplayResponse(BaseModel):
    title: str
    scenario: str
    performance_indicators: List[str]
    difficulty: str
    business_type: str
    meet_with: str

class TestQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_answer: int
    explanation: str
    category: str

class TestResponse(BaseModel):
    test_type: str
    questions: List[TestQuestion]

class WrittenFeedbackResponse(BaseModel):
    overall_score: int
    strengths: List[str]
    improvements: List[str]
    section_feedback: Optional[Dict[str, str]] = None
    summary: str
```

Create `app/api/endpoints/ai.py`:

```python
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional

from app.clients.decade_client import DecadeClient
from app.models.ai import (
    RoleplayRequest, RoleplayResponse,
    TestRequest, TestResponse,
    WrittenFeedbackRequest, WrittenFeedbackResponse
)
from app.core.security import validate_session

router = APIRouter()
decade_client = DecadeClient()

@router.get("/status")
async def ai_status():
    """Check if the AI system is operational"""
    try:
        status = await decade_client.check_ai_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking AI status: {str(e)}")

@router.post("/roleplay", response_model=RoleplayResponse)
async def generate_roleplay(
    request: RoleplayRequest,
    current_user = Depends(validate_session)
):
    """Generate a DECA roleplay scenario"""
    try:
        roleplay = await decade_client.generate_roleplay(
            user_id=current_user.id,
            instructional_area=request.instructional_area,
            performance_indicators=request.performance_indicators,
            difficulty_level=request.difficulty_level,
            business_type=request.business_type
        )
        return roleplay
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating roleplay: {str(e)}")

@router.post("/test", response_model=TestResponse)
async def generate_test(
    request: TestRequest,
    current_user = Depends(validate_session)
):
    """Generate DECA practice test questions"""
    try:
        test = await decade_client.generate_test(
            user_id=current_user.id,
            test_type=request.test_type,
            categories=request.categories,
            num_questions=request.num_questions
        )
        return test
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating test: {str(e)}")

@router.post("/written-feedback", response_model=WrittenFeedbackResponse)
async def get_written_feedback(
    request: WrittenFeedbackRequest,
    current_user = Depends(validate_session)
):
    """Get feedback on a written DECA event submission"""
    try:
        feedback = await decade_client.get_written_feedback(
            user_id=current_user.id,
            event_type=request.event_type,
            content=request.content,
            sections=request.sections
        )
        return feedback
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting written feedback: {str(e)}")
```

### 2. Chat Integration

Create `app/models/chat.py`:

```python
from pydantic import BaseModel
from typing import Optional, Dict, List, Any, Union

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    is_unrelated: bool = False
    should_exit: bool = False

class RoleplayFeedbackRequest(BaseModel):
    roleplay_id: str
    user_response: str

class RoleplayFeedbackResponse(BaseModel):
    feedback: str

class PIExplanationRequest(BaseModel):
    indicator: str
    category: Optional[str] = None

class PIExplanationResponse(BaseModel):
    explanation: str
```

Create `app/api/endpoints/chat.py`:

```python
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional

from app.clients.decade_client import DecadeClient
from app.models.chat import (
    ChatMessage, ChatResponse,
    RoleplayFeedbackRequest, RoleplayFeedbackResponse,
    PIExplanationRequest, PIExplanationResponse
)
from app.core.security import get_optional_user

router = APIRouter()
decade_client = DecadeClient()

@router.post("/diego", response_model=ChatResponse)
async def chat_with_diego(
    message: ChatMessage,
    current_user = Depends(get_optional_user)
):
    """Chat with Diego, the dolphin assistant"""
    try:
        response = await decade_client.chat_with_diego(
            message=message.message,
            user_id=current_user.id if current_user else None
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error chatting with Diego: {str(e)}")

@router.post("/roleplay-feedback", response_model=RoleplayFeedbackResponse)
async def get_roleplay_feedback(
    request: RoleplayFeedbackRequest,
    current_user = Depends(get_optional_user)
):
    """Get feedback on a roleplay response"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    try:
        feedback = await decade_client.get_roleplay_feedback(
            user_id=current_user.id,
            roleplay_id=request.roleplay_id,
            user_response=request.user_response
        )
        return feedback
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting roleplay feedback: {str(e)}")

@router.post("/explain-pi", response_model=PIExplanationResponse)
async def explain_performance_indicator(
    request: PIExplanationRequest,
    current_user = Depends(get_optional_user)
):
    """Get an explanation for a performance indicator"""
    try:
        explanation = await decade_client.explain_pi(
            indicator=request.indicator,
            category=request.category,
            user_id=current_user.id if current_user else None
        )
        return explanation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error explaining performance indicator: {str(e)}")
```

### 3. Data Access Integration

Create `app/api/endpoints/data.py`:

```python
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List, Dict, Any

from app.clients.decade_client import DecadeClient
from app.core.security import validate_session, get_optional_user

router = APIRouter()
decade_client = DecadeClient()

@router.get("/deca-events")
async def get_deca_events():
    """Get all DECA events data"""
    try:
        events = await decade_client.get_deca_events()
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching DECA events: {str(e)}")

@router.get("/subscription-tiers")
async def get_subscription_tiers():
    """Get all available subscription tiers"""
    try:
        tiers = await decade_client.get_subscription_tiers()
        return tiers
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching subscription tiers: {str(e)}")

@router.get("/performance-indicators")
async def get_performance_indicators(
    category: Optional[str] = None,
    current_user = Depends(validate_session)
):
    """Get performance indicators for the current user"""
    try:
        indicators = await decade_client.get_performance_indicators(
            user_id=current_user.id,
            category=category
        )
        return indicators
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching performance indicators: {str(e)}")

@router.get("/user/stats")
async def get_user_stats(current_user = Depends(validate_session)):
    """Get statistics for the current user"""
    try:
        stats = await decade_client.get_user_stats(user_id=current_user.id)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user stats: {str(e)}")

@router.get("/user/activities")
async def get_user_activities(current_user = Depends(validate_session)):
    """Get learning activities for the current user"""
    try:
        activities = await decade_client.get_user_activities(user_id=current_user.id)
        return activities
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user activities: {str(e)}")
```

## API Client Utilities

Create the DecA(I)de client in `app/clients/decade_client.py`:

```python
import httpx
import json
from typing import Dict, List, Optional, Any, Union
from app.core.config import settings

class DecadeClient:
    """Client for interacting with the DecA(I)de API"""
    
    def __init__(self):
        self.base_url = settings.DECADE_API_BASE_URL
        self.api_secret = settings.DECADE_API_SECRET
        self.headers = {
            "Content-Type": "application/json",
            "X-API-Secret": self.api_secret
        }
    
    async def _request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict[str, Any]] = None,
        session_id: Optional[str] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> Any:
        """Make a request to the DecA(I)de API"""
        url = f"{self.base_url}{endpoint}"
        
        headers = self.headers.copy()
        if session_id:
            headers["Cookie"] = f"connect.sid={session_id}"
        
        async with httpx.AsyncClient() as client:
            if method == "GET":
                response = await client.get(url, headers=headers, params=params)
            elif method == "POST":
                response = await client.post(url, headers=headers, json=data, params=params)
            elif method == "PUT":
                response = await client.put(url, headers=headers, json=data, params=params)
            elif method == "DELETE":
                response = await client.delete(url, headers=headers, params=params)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            if response.status_code >= 400:
                try:
                    error_detail = response.json()
                    error_message = error_detail.get("error", "Unknown error")
                except:
                    error_message = response.text
                raise Exception(f"API error ({response.status_code}): {error_message}")
                
            return response.json()
    
    # Authentication Methods
    
    async def register_user(
        self,
        username: str,
        password: str,
        email: Optional[str] = None,
        event_format: Optional[str] = None,
        event_code: Optional[str] = None,
        event_type: Optional[str] = None,
        instructional_area: Optional[str] = None
    ) -> Dict[str, Any]:
        """Register a new user"""
        data = {
            "username": username,
            "password": password,
            "email": email,
            "eventFormat": event_format,
            "eventCode": event_code,
            "eventType": event_type,
            "instructionalArea": instructional_area
        }
        
        return await self._request("POST", "/auth/register", data=data)
    
    async def login_user(self, username: str, password: str) -> Dict[str, Any]:
        """Login a user and get their session"""
        data = {
            "username": username,
            "password": password
        }
        
        return await self._request("POST", "/auth/login", data=data)
    
    async def logout_user(self, session_id: str) -> Dict[str, Any]:
        """Logout a user"""
        return await self._request("POST", "/auth/logout", session_id=session_id)
    
    # AI Methods
    
    async def check_ai_status(self) -> Dict[str, Any]:
        """Check if the AI system is operational"""
        return await self._request("GET", "/api/ai/status")
    
    async def generate_roleplay(
        self,
        user_id: int,
        instructional_area: str,
        performance_indicators: List[str],
        difficulty_level: str,
        business_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a roleplay scenario"""
        data = {
            "instructionalArea": instructional_area,
            "performanceIndicators": performance_indicators,
            "difficultyLevel": difficulty_level
        }
        
        if business_type:
            data["businessType"] = business_type
            
        return await self._request("POST", "/api/ai/generate-roleplay", data=data)
    
    async def generate_test(
        self,
        user_id: int,
        test_type: str,
        categories: List[str],
        num_questions: int
    ) -> Dict[str, Any]:
        """Generate a practice test"""
        data = {
            "testType": test_type,
            "categories": categories,
            "numQuestions": num_questions
        }
            
        return await self._request("POST", "/api/ai/generate-test", data=data)
    
    async def get_written_feedback(
        self,
        user_id: int,
        event_type: str,
        content: str,
        sections: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Get feedback on a written event"""
        data = {
            "eventType": event_type,
            "content": content
        }
        
        if sections:
            data["sections"] = sections
            
        return await self._request("POST", "/api/ai/written-event-feedback", data=data)
    
    # Chat Methods
    
    async def chat_with_diego(
        self,
        message: str,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Chat with Diego assistant"""
        data = {"message": message}
        return await self._request("POST", "/api/chat/diego", data=data)
    
    async def get_roleplay_feedback(
        self,
        user_id: int,
        roleplay_id: str,
        user_response: str
    ) -> Dict[str, Any]:
        """Get feedback on a roleplay response"""
        data = {
            "roleplayId": roleplay_id,
            "userResponse": user_response
        }
        return await self._request("POST", "/api/chat/roleplay-feedback", data=data)
    
    async def explain_pi(
        self,
        indicator: str,
        category: Optional[str] = None,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get an explanation for a performance indicator"""
        data = {"indicator": indicator}
        
        if category:
            data["category"] = category
            
        return await self._request("POST", "/api/chat/explain-pi", data=data)
    
    # Data Access Methods
    
    async def get_deca_events(self) -> Dict[str, Any]:
        """Get all DECA events data"""
        return await self._request("GET", "/api/deca-events")
    
    async def get_subscription_tiers(self) -> Dict[str, Any]:
        """Get all subscription tiers"""
        return await self._request("GET", "/api/subscription-tiers")
    
    async def get_performance_indicators(
        self,
        user_id: int,
        category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get performance indicators for a user"""
        params = {}
        if category:
            params["category"] = category
            
        return await self._request("GET", "/api/performance-indicators", params=params)
    
    async def get_user_stats(self, user_id: int) -> Dict[str, Any]:
        """Get statistics for a user"""
        return await self._request("GET", "/api/user/stats")
    
    async def get_user_activities(self, user_id: int) -> List[Dict[str, Any]]:
        """Get learning activities for a user"""
        return await self._request("GET", "/api/user/activities")
```

### Security Utilities

Create `app/core/security.py`:

```python
import jwt
from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from app.models.user import UserResponse
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def create_session_token(session_data: Dict[str, Any]) -> str:
    """Create a JWT session token"""
    payload = {
        "sub": str(session_data.get("user").get("id")),
        "exp": datetime.utcnow() + timedelta(days=1),
        "iat": datetime.utcnow(),
        "session_id": session_data.get("session_id")
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def decode_token(token: str) -> Dict[str, Any]:
    """Decode a JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def validate_session(
    token: Optional[str] = Depends(oauth2_scheme),
    decade_session: Optional[str] = Cookie(None)
) -> UserResponse:
    """Validate the user session and return the current user"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_token(token)
    
    if not decade_session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="DecA(I)de session expired or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Here you would validate the session with DecA(I)de
    # For simplicity, we'll just trust the JWT claims
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Mock user for demonstration, in real implementation
    # you would fetch this from DecA(I)de API
    return UserResponse(
        id=int(user_id),
        username="example_user",
        email="user@example.com",
        subscription_tier="standard"
    )

async def get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme),
    decade_session: Optional[str] = Cookie(None)
) -> Optional[UserResponse]:
    """Get the current user if authenticated, otherwise None"""
    if not token or not decade_session:
        return None
    
    try:
        return await validate_session(token, decade_session)
    except HTTPException:
        return None
```

## Sample Integration Code

### Direct AI Request Example

Here's how to use the FastAPI integration to make direct AI requests when appropriate:

```python
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import Optional, List

from app.clients.decade_client import DecadeClient
from app.models.ai import RoleplayRequest, RoleplayResponse
from app.core.security import validate_session
from app.services.azure_openai import get_azure_openai_client

router = APIRouter()
decade_client = DecadeClient()

@router.post("/roleplay/direct", response_model=RoleplayResponse)
async def generate_roleplay_direct(
    request: RoleplayRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(validate_session)
):
    """Generate a roleplay scenario directly through Azure OpenAI if available"""
    # First try to use DecA(I)de API
    try:
        roleplay = await decade_client.generate_roleplay(
            user_id=current_user.id,
            instructional_area=request.instructional_area,
            performance_indicators=request.performance_indicators,
            difficulty_level=request.difficulty_level,
            business_type=request.business_type
        )
        
        # Record usage in background
        background_tasks.add_task(
            record_usage,
            user_id=current_user.id,
            activity_type="roleplay_generation",
            details={"direct": False}
        )
        
        return roleplay
    except Exception as primary_error:
        # If DecA(I)de API fails and direct access is configured, try Azure OpenAI directly
        if not all([settings.AZURE_OPENAI_KEY, settings.AZURE_OPENAI_ENDPOINT, settings.AZURE_OPENAI_DEPLOYMENT]):
            raise HTTPException(status_code=500, detail=f"Error generating roleplay: {str(primary_error)}")
        
        try:
            # Get Azure OpenAI client
            client = get_azure_openai_client()
            
            # Format the prompt similar to how DecA(I)de does it
            system_message = "You are a DECA roleplay scenario generator. Create realistic, challenging, and educational DECA roleplay scenarios for high school students."
            
            prompt = f"""
            Create a realistic DECA roleplay scenario for a {request.difficulty_level} difficulty level. 
            The scenario should focus on the instructional area of "{request.instructional_area}" 
            and include the following performance indicators: {', '.join(request.performance_indicators)}.
            The scenario should involve a {request.business_type or 'retail business'}.
            
            Format your response as a JSON object with the following properties:
            - title: A catchy title for the roleplay
            - scenario: A 2-3 paragraph description of the business situation
            - performanceIndicators: An array of the provided performance indicators
            - difficulty: The difficulty level provided
            - businessType: The type of business involved
            - meetWith: The title/role of the person the student will be meeting with in the roleplay
            """
            
            response = await client.get_chat_completions(
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            # Parse the response
            roleplay_json = json.loads(response.choices[0].message.content)
            
            # Record direct usage in background
            background_tasks.add_task(
                record_usage,
                user_id=current_user.id,
                activity_type="roleplay_generation",
                details={"direct": True}
            )
            
            return roleplay_json
            
        except Exception as direct_error:
            # If both methods fail, report the original error
            raise HTTPException(
                status_code=500, 
                detail=f"Error generating roleplay. Primary error: {str(primary_error)}. Direct error: {str(direct_error)}"
            )

async def record_usage(user_id: int, activity_type: str, details: Dict[str, Any]):
    """Record user activity in the background"""
    try:
        # Implementation would depend on your logging/analytics system
        pass
    except Exception as e:
        # Log the error but don't fail the main request
        print(f"Error recording usage: {str(e)}")
```

## Best Practices

When integrating with the DecA(I)de platform, follow these best practices:

1. **Handle Authentication Properly**:
   - Use secure HTTP-only cookies for session management
   - Implement proper token validation and refresh mechanisms
   - Store sensitive credentials securely

2. **Error Handling**:
   - Implement comprehensive error handling for all API calls
   - Provide meaningful error messages to users
   - Log detailed errors for debugging

3. **Performance Optimization**:
   - Cache frequently accessed data like DECA events and subscription tiers
   - Use background tasks for non-critical operations
   - Implement rate limiting to prevent abuse

4. **Security**:
   - Use HTTPS for all communications
   - Implement proper CORS settings
   - Validate all user inputs
   - Use parameterized queries for database operations

5. **Fallback Mechanisms**:
   - Implement graceful degradation when services are unavailable
   - Have fallback options for critical functionality

6. **Monitoring and Logging**:
   - Implement comprehensive logging for all API interactions
   - Set up monitoring for API performance and errors
   - Track usage patterns and optimize accordingly

## Troubleshooting

### Common Issues and Solutions

1. **Authentication Failures**:
   - Verify that session cookies are being properly sent and stored
   - Check that the JWT token is valid and not expired
   - Ensure the DecA(I)de API secret is correctly configured

2. **API Response Errors**:
   - Check API request formatting and parameters
   - Verify user permissions for the requested operation
   - Check subscription tier limits

3. **Performance Issues**:
   - Implement caching for frequently accessed data
   - Use connection pooling for HTTP requests
   - Consider adding a proxy or CDN for static content

4. **AI Generation Issues**:
   - Verify Azure OpenAI credentials are valid
   - Check if deployment is active and available
   - Consider implementing retry mechanisms with exponential backoff

### Logging and Debugging

Add comprehensive logging to your FastAPI application:

```python
import logging
from fastapi import FastAPI, Request
import time

app = FastAPI()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)

logger = logging.getLogger("decade-integration")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests with timing information"""
    start_time = time.time()
    
    # Get the client IP
    forwarded_for = request.headers.get("X-Forwarded-For")
    client_ip = forwarded_for.split(",")[0] if forwarded_for else request.client.host
    
    logger.info(f"Request: {request.method} {request.url.path} from {client_ip}")
    
    response = await call_next(request)
    
    # Calculate processing time
    process_time = time.time() - start_time
    logger.info(f"Response: {response.status_code} in {process_time:.4f}s")
    
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Log all unhandled exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

---

This integration guide provides a comprehensive framework for building a FastAPI backend that interacts with the DecA(I)de platform. By following these guidelines, you can create a robust, secure, and efficient integration that leverages the power of AI-driven educational content for your applications.