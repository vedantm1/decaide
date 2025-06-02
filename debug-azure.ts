import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

async function debugAzureConnection() {
  console.log('Environment variables:');
  console.log('AZURE_OPENAI_KEY:', process.env.AZURE_OPENAI_KEY ? 'Set' : 'Not set');
  console.log('AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT);
  console.log('AZURE_OPENAI_DEPLOYMENT:', process.env.AZURE_OPENAI_DEPLOYMENT);
  
  try {
    const credential = new AzureKeyCredential(process.env.AZURE_OPENAI_KEY!);
    const client = new OpenAIClient(process.env.AZURE_OPENAI_ENDPOINT!, credential);
    
    console.log('\nTesting with deployment name:', process.env.AZURE_OPENAI_DEPLOYMENT);
    
    const response = await client.getChatCompletions(
      process.env.AZURE_OPENAI_DEPLOYMENT!,
      [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello" }
      ],
      {
        maxTokens: 50
      }
    );
    
    console.log('Success! Response:', response.choices[0].message?.content);
    
  } catch (error: any) {
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      status: error.status
    });
  }
}

debugAzureConnection();