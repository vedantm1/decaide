import { checkAzureOpenAI, generateTestQuestions } from './server/services/azureOpenai';

async function testConnection() {
  console.log('Testing Azure OpenAI connection...');
  
  try {
    const status = await checkAzureOpenAI();
    console.log('Connection Status:', JSON.stringify(status, null, 2));
    
    if (status.isConnected) {
      console.log('\nTesting practice test generation...');
      const testResult = await generateTestQuestions({
        testType: 'Business Management & Administration',
        categories: ['Marketing', 'Finance', 'Management'],
        numQuestions: 3
      });
      console.log('Test Generation Result:', JSON.stringify(testResult, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testConnection();