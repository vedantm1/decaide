# Azure OpenAI Integration Documentation

This document provides a detailed overview of how Azure OpenAI is integrated into the DecA(I)de platform.

## Environment Variables

The platform requires the following environment variables for Azure OpenAI functionality:

| Variable | Description | Current Value |
|----------|-------------|---------------|
| `AZURE_OPENAI_KEY` | API key for accessing Azure OpenAI | [SECURED] |
| `AZURE_OPENAI_ENDPOINT` | Endpoint URL for the Azure OpenAI service | [SECURED] |
| `AZURE_OPENAI_DEPLOYMENT` | Deployment name for the model | decaideai |

## Azure OpenAI Integration Structure

The integration is structured as follows:

1. **Environment Variable Management**:
   - Environment variables are loaded using dotenv.
   - Variables are checked for presence during initialization.
   - If any required variable is missing, appropriate warnings are logged.

2. **Client Initialization**:
   - The Azure OpenAI client is created using the OpenAIClient class from the @azure/openai package.
   - The client is initialized with the endpoint URL and API key.
   - Error handling is implemented to catch authentication or connection issues.

3. **API Endpoints and Function Calls**:
   - Four main AI generation functions are implemented:
     - `generateRoleplayScenario`: Creates realistic DECA roleplay scenarios
     - `generatePracticeTest`: Creates multiple-choice practice tests
     - `explainPerformanceIndicator`: Explains DECA performance indicators
     - `generateWrittenEventFeedback`: Provides feedback on written event sections

4. **System Prompts**:
   - Each function uses carefully crafted system prompts to guide the AI.
   - These prompts are designed to produce consistent, high-quality outputs.
   - Each prompt includes specific instructions for format, tone, and content.

5. **Response Parsing**:
   - Responses from the API are parsed to extract relevant information.
   - Helper functions extract specific sections, bullet points, and scores.
   - Error handling ensures graceful failure if parsing fails.

## Deployment Issues and Troubleshooting

Currently, we are encountering this error:
```
The API deployment for this resource does not exist. If you created the deployment within the last 5 minutes, please wait a moment and try again.
```

This indicates one of the following issues:

1. The deployment name "decaideai" may not exist in the Azure OpenAI resource.
2. The deployment was recently created and is not yet ready.
3. The deployment exists but with a different name than what's specified in the environment variable.

### Deployment Name Verification

To resolve this issue:

1. **Verify deployment name**: Check in the Azure portal that the deployment "decaideai" exists.
2. **Check deployment model**: Ensure the deployment is using GPT-4o-mini or the intended model.
3. **Update environment variable**: If the deployment has a different name, update the AZURE_OPENAI_DEPLOYMENT environment variable.

## API Call Structure

Here's an example of how a typical API call is structured:

```javascript
const response = await client.getChatCompletions(
  AZURE_OPENAI_DEPLOYMENT,
  [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ],
  {
    temperature: 0.7,
    maxTokens: 2000
  }
);
```

Parameters explained:
- `AZURE_OPENAI_DEPLOYMENT`: The deployment name in Azure
- Message array: Contains system and user prompts that guide the AI
- Options object: Contains settings like temperature (creativity) and token limits

## Error Handling

The implementation includes robust error handling:

1. **Missing credentials**: Checks for missing environment variables
2. **API errors**: Catches and logs errors from the Azure OpenAI service
3. **Parsing errors**: Handles errors that may occur during response parsing
4. **Rate limiting**: Will be implemented to handle rate limit errors (TODO)

## Testing

A dedicated test script (`test-azure-openai.js`) is provided to verify Azure OpenAI integration. This script:

1. Loads environment variables
2. Creates an OpenAI client
3. Sends a simple test request
4. Displays the response or error details

Running the test:
```
node test-azure-openai.js
```

## Additional Documentation

For more details about Azure OpenAI and the concepts used in this integration, refer to:

- [Azure OpenAI Service Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference/introduction)
- [GPT-4o-mini Model Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#gpt-4o-mini)