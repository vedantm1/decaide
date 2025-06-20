# Getting Started with DecA(I)de

This guide will walk you through setting up and running the DecA(I)de platform on your development or production environment.

## Prerequisites

Before beginning, make sure you have the following:

- Node.js (version 18.x or later recommended)
- npm (version 8.x or later)
- PostgreSQL database (version 13.x or later)
- Access to Azure OpenAI services
- (Optional) Stripe account for payment processing

## Step 1: Clone and Install Dependencies

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/decade.git
   cd decade
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

## Step 2: Environment Setup

1. Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your specific configuration values:
   ```
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/decade_db

   # Azure OpenAI
   AZURE_OPENAI_KEY=your_azure_openai_key
   AZURE_OPENAI_ENDPOINT=https://your-instance.openai.azure.com/
   AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini

   # Session Configuration
   SESSION_SECRET=your_secure_session_secret

   # Stripe Configuration (optional)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

3. For detailed Azure OpenAI setup instructions, refer to [AZURE_OPENAI_SETUP.md](./AZURE_OPENAI_SETUP.md).

## Step 3: Database Setup

1. Create a PostgreSQL database:
   ```bash
   createdb decade_db
   # Or use your PostgreSQL administration tool of choice
   ```

2. Push the schema to the database:
   ```bash
   npm run db:push
   ```

## Step 4: Starting the Application

### Development Mode

1. Start the application in development mode:
   ```bash
   npm run dev
   ```

   This command starts:
   - An Express server for the backend at http://localhost:3000
   - A Vite dev server for the frontend at http://localhost:5173

2. Access the application in your browser at http://localhost:5173

### Production Mode

1. Build the frontend assets:
   ```bash
   npm run build
   ```

2. Start the application in production mode:
   ```bash
   npm start
   ```

3. Access the application in your browser at http://localhost:3000

## Step 5: Verifying the Setup

### 1. Check the API Status

To verify that your backend API is running correctly:

```bash
curl http://localhost:3000/api/health
```

You should receive a JSON response like:
```json
{"status":"healthy"}
```

### 2. Check Azure OpenAI Integration

To verify Azure OpenAI integration:

```bash
curl http://localhost:3000/api/ai/status
```

Expected response if properly configured:
```json
{
  "status": "operational",
  "deployment": "gpt-4o-mini",
  "message": "Azure OpenAI is working properly"
}
```

### 3. Frontend Verification

1. Open http://localhost:5173 (development) or http://localhost:3000 (production)
2. You should see the DecA(I)de landing page
3. Register a test account to verify authentication is working

## Step 6: Creating an Admin Account

To create an initial admin account:

1. Register a regular account through the web interface
2. Access the database and update the user record:

```sql
UPDATE users SET role = 'admin' WHERE username = 'your_username';
```

## Troubleshooting

### Common Issues

#### Database Connection Problems

If you encounter database connection issues:

1. Verify your PostgreSQL server is running:
   ```bash
   pg_isready
   ```

2. Check your `DATABASE_URL` in the `.env` file
3. Ensure the database exists and is accessible:
   ```bash
   psql -c "\l" | grep decade_db
   ```

#### Azure OpenAI Connection Issues

If AI features aren't working:

1. Verify your Azure OpenAI keys and endpoint:
   ```bash
   node test-azure-integration.js
   ```

2. Check the deployment name is correct
3. Ensure your Azure subscription has adequate quota

#### Frontend Build Errors

For Vite build errors:

1. Check for any TypeScript errors:
   ```bash
   npm run lint
   ```

2. Clear the build cache and node modules (if needed):
   ```bash
   rm -rf node_modules .vite
   npm install
   ```

### Getting Help

If you encounter issues not covered here:

1. Check the logs for more detailed error messages:
   ```bash
   # For backend logs
   npm run logs:server
   
   # For frontend logs
   npm run logs:client
   ```

2. Review the API documentation at [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Consult the [AZURE_OPENAI_SETUP.md](./AZURE_OPENAI_SETUP.md) for AI configuration issues

## Next Steps

Once you have the platform running successfully, you may want to:

1. Customize the UI theme by editing `theme.json`
2. Add or modify DECA events and performance indicators in `shared/schema.ts`
3. Implement Stripe payment processing
4. Set up automated testing with:
   ```bash
   npm test
   ```

For integration with external systems, refer to [FASTAPI_INTEGRATION_GUIDE.md](./FASTAPI_INTEGRATION_GUIDE.md).

---

Congratulations! You now have a functioning DecA(I)de platform ready for development or deployment.