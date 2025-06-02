async function testDirectAPI() {
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = "decaide_test"; // Using the deployment name from your URL
  
  console.log('Testing direct API call...');
  console.log('Endpoint:', endpoint);
  console.log('Deployment:', deployment);
  
  const url = `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=2025-01-01-preview`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey!
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Generate 2 DECA test questions about marketing." }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Success! Response:', data.choices[0].message.content);
    } else {
      console.error('API Error:', data);
    }
    
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testDirectAPI();