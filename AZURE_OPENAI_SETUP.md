# Azure OpenAI Setup Guide for DecA(I)de

This guide provides detailed instructions for setting up and configuring Azure OpenAI for use with the DecA(I)de platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Azure OpenAI Service Setup](#azure-openai-service-setup)
3. [Deployment Configuration](#deployment-configuration)
4. [Environment Variables](#environment-variables)
5. [Testing the Configuration](#testing-the-configuration)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)
8. [Monitoring and Optimization](#monitoring-and-optimization)

## Prerequisites

Before you begin, ensure you have:

- An active Azure subscription with access to Azure OpenAI services
- Administrative permissions to create and manage Azure resources
- Basic familiarity with Azure portal
- Administrative access to your DecA(I)de deployment

## Azure OpenAI Service Setup

### 1. Creating an Azure OpenAI Resource

1. Sign in to the [Azure Portal](https://portal.azure.com/).
2. Click on **Create a resource**.
3. Search for **Azure OpenAI** and select it.
4. Click **Create**.
5. Fill in the required details:
   - **Subscription**: Select your Azure subscription
   - **Resource group**: Create a new one or select an existing group
   - **Region**: Choose a region where Azure OpenAI is available
   - **Name**: Provide a unique name for your OpenAI resource
   - **Pricing tier**: Select the appropriate tier (Standard S0 recommended for production)
6. Click **Review + create**, and then **Create**.

### 2. Accessing Your OpenAI Resource

1. Once deployment is complete, go to your newly created Azure OpenAI resource.
2. Navigate to **Keys and Endpoint** from the left menu.
3. You will need the following information:
   - **Key**: One of the authentication keys (Key 1 or Key 2)
   - **Endpoint**: The URL endpoint for your Azure OpenAI resource

## Deployment Configuration

### 1. Creating a Model Deployment

1. From your Azure OpenAI resource, click on **Model deployments** in the left navigation.
2. Click on **Manage deployments** (which redirects to Azure OpenAI Studio).
3. In Azure OpenAI Studio, click on **Deployments** in the left menu.
4. Click **Create new deployment**.
5. Configure the deployment:
   - **Model**: Select `gpt-4o-mini` or the latest version available
   - **Deployment name**: Enter `gpt-4o-mini` (or choose a custom name)
   - **Advanced options**: Adjust as needed based on your expected usage
6. Click **Create**.

### 2. Testing the Model

1. In Azure OpenAI Studio, click on **Chat** in the left menu.
2. Select your deployment from the dropdown.
3. Try sending a test message like: "Write a short introduction about DECA competitions."
4. You should receive a coherent response about DECA competitions.

## Environment Variables

To connect DecA(I)de to your Azure OpenAI service, you need to configure the following environment variables:

1. Edit the `.env` file in your DecA(I)de installation directory.
2. Update or add these variables:

```
AZURE_OPENAI_KEY=your-azure-openai-key
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
```

Replace the values with:
- `your-azure-openai-key`: The API key from the Keys and Endpoint section
- `your-resource-name`: Your Azure OpenAI resource name
- `gpt-4o-mini`: The deployment name you created (or your custom name)

## Testing the Configuration

### 1. Run the Integration Test Script

The DecA(I)de platform includes a test script to verify Azure OpenAI integration. Run:

```bash
node test-azure-integration.js
```

You should see successful output confirming the connection to Azure OpenAI and a sample response.

### 2. Check API Status

You can also check the API status through the DecA(I)de API:

```bash
curl http://localhost:3000/api/ai/status
```

A successful response should look like:

```json
{
  "status": "operational",
  "deployment": "gpt-4o-mini",
  "message": "Azure OpenAI is working properly"
}
```

## Troubleshooting

### Common Issues and Solutions

1. **Authentication Error**:
   - Double-check your API key is correct
   - Ensure the key has not been regenerated in the Azure portal
   - Verify there are no extra spaces or characters in your `.env` file

2. **Resource Not Found**:
   - Verify the endpoint URL is correct
   - Check if the deployment name matches exactly what's in Azure OpenAI Studio
   - Ensure the model deployment is actually completed and active

3. **Rate Limit or Quota Exceeded**:
   - Check your Azure OpenAI service quotas in the Azure portal
   - Consider upgrading your tier or requesting a quota increase
   - Implement request rate limiting in your application

4. **Invalid Request Format**:
   - Check the Azure OpenAI API version compatibility
   - Ensure your request parameters (like temperature, max tokens) are within valid ranges

### Checking Logs

For more detailed error information, check the application logs:

```bash
# View the last 100 lines of application logs
npm run logs

# Or if using PM2
pm2 logs decade
```

## Best Practices

1. **API Key Management**:
   - Never commit API keys to version control
   - Regularly rotate your API keys
   - Use Azure Key Vault for production environments
   - Set appropriate access controls on your `.env` file

2. **Performance Optimization**:
   - Set appropriate `maxTokens` limits for each endpoint
   - Adjust `temperature` settings based on creativity needs (0.0-1.0)
   - Use appropriate model versions based on complexity requirements
   - Implement client-side caching for frequent requests

3. **Cost Management**:
   - Monitor usage regularly
   - Implement rate limiting
   - Use budget alerts in Azure
   - Consider using smaller models for simpler tasks

4. **Fallback Mechanisms**:
   - Implement error handling and retries
   - Have offline or cached responses for critical features
   - Consider having a backup model deployment

## Monitoring and Optimization

### 1. Monitoring Azure OpenAI Usage

1. In the Azure portal, go to your OpenAI resource.
2. Click on **Metrics** in the left menu.
3. Add metrics for:
   - **Requests** (total number of requests)
   - **Token Count** (usage of tokens)
   - **Errors** (number of failed requests)

### 2. Setting Up Alerts

1. In the Azure portal, go to your OpenAI resource.
2. Click on **Alerts** in the left menu.
3. Create alerts for:
   - High error rates
   - Quota approaching limits
   - Unusual spikes in usage

### 3. Optimizing Performance

To get the best performance from Azure OpenAI in DecA(I)de:

1. **System Prompts**:
   - Review and optimize the system prompts in the codebase
   - Good system prompts lead to better, more consistent responses

2. **Parameter Tuning**:
   - Adjust `temperature` (0.0-1.0) - lower for more deterministic responses
   - Set appropriate `maxTokens` for each endpoint
   - Use `responseFormat` for structured outputs

3. **Request Batching**:
   - For bulk operations, implement request batching
   - Consider implementing a queue system for high-volume periods

### 4. Auto-Scaling (For Production)

For production environments with variable load:

1. Set up auto-scaling for your application servers
2. Implement a queueing system for AI requests during peak times
3. Use load balancing to distribute requests

## Advanced Configuration

For production environments, consider these additional configurations:

1. **Regional Failover**:
   - Set up Azure OpenAI in multiple regions
   - Implement failover logic in your application

2. **Custom Prompts Library**:
   - Create and maintain a library of effective prompts
   - Implement A/B testing to optimize prompts

3. **Output Filtering**:
   - Implement content filtering for appropriate educational content
   - Set up review processes for AI-generated content

---

For more information or assistance, contact your Azure administrator or the DecA(I)de support team.