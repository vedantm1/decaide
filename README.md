# DecA(I)de: AI-Powered DECA Competition Training Platform

DecA(I)de is an educational platform that helps high school students prepare for DECA business competitions through AI-generated content, interactive practice, and performance tracking.

![DecA(I)de Logo](https://via.placeholder.com/500x100?text=DecA(I)de+Logo)

## 🔍 Overview

DecA(I)de leverages Azure OpenAI's GPT models to provide personalized learning experiences for DECA competitors, including:

- AI-generated roleplay scenarios
- Practice tests with automated grading
- Written event feedback and evaluation
- Performance indicator training
- Diego the dolphin assistant for questions and guidance
- Comprehensive statistics and progress tracking
- Gamification with achievements and points

## 🛠️ Technology Stack

- **Frontend**: React.js with Shadcn UI components
- **Backend**: Express.js (Node.js)
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Azure OpenAI (GPT-4o-mini)
- **Authentication**: Passport.js
- **Payment Processing**: Stripe

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js (v18+)
- PostgreSQL database
- Azure OpenAI API access
- Stripe account (for payment processing)

## 🚀 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/decade.git
   cd decade
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run database migrations:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Access the application:
   ```
   Frontend: http://localhost:5173
   Backend API: http://localhost:3000
   ```

## 🌐 API Documentation

The platform provides comprehensive APIs for integration with external systems. Detailed documentation is available in:

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [FastAPI Integration Guide](./FASTAPI_INTEGRATION_GUIDE.md) - Guide for integrating with FastAPI backends

## 🧩 Features

### 1. AI-Generated Roleplay Scenarios

Practice DECA roleplay events with dynamically generated scenarios tailored to specific:
- Instructional areas
- Performance indicators
- Difficulty levels
- Business types

### 2. Practice Tests

Generate customized practice tests for DECA exams with:
- Multiple-choice questions
- Category-specific content
- Difficulty adjustment
- Immediate feedback and explanations

### 3. Written Event Feedback

Submit written event papers for AI evaluation, including:
- Overall score assessment
- Identification of strengths and weaknesses
- Section-by-section feedback
- Improvement suggestions

### 4. Diego Assistant

Chat with Diego, a friendly dolphin AI assistant, who can:
- Answer DECA-related questions
- Explain business concepts
- Provide competition tips
- Offer performance indicator explanations

### 5. Performance Tracking

Monitor your progress with comprehensive statistics:
- Practice history
- Performance trends
- Strengths and weaknesses
- Recommended focus areas

### 6. Subscription Model

Choose from three subscription tiers:
- **Standard**: Basic features with limited monthly usage
- **Plus**: Enhanced features with increased usage limits
- **Pro**: Premium features with unlimited usage

## 📱 User Interface

DecA(I)de features a modern, responsive design with:
- Memphis-style UI design
- Customizable themes and color schemes
- Intuitive navigation
- Mobile-friendly layout

## 🔒 Authentication and Security

The platform implements secure authentication using:
- Passport.js for user management
- Session-based authentication
- Password hashing with bcrypt
- CSRF protection

## 🔄 Integration Options

External systems can integrate with DecA(I)de through:
- RESTful APIs
- Session-based authentication
- Subscription validation
- Content generation endpoints

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions, please contact our team at decaide569@gmail.com


---

Proudly supporting DECA students in their journey to become emerging leaders and entrepreneurs in marketing, finance, hospitality, and management.
