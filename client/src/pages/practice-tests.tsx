import React, { useState, useEffect } from 'react';
import { testTypes, categoriesList } from '../../../shared/schema.js';

interface Question {
  question: string;
  answer: string;
}

interface TestResult {
  test: Question[];
}

export default function PracticeTestsPage() {
  const [testType, setTestType] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [testResult, setTestResult] = useState<Question[]>([]);

  // Initialize with first test type if available
  useEffect(() => {
    if (testTypes && testTypes.length > 0) {
      setTestType(testTypes[0]);
    }
  }, []);

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, category]);
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    }
  };

  const handleGenerate = async () => {
    if (!testType || selectedCategories.length === 0 || numQuestions <= 0) {
      setError('Please select a test type, at least one category, and enter a valid number of questions.');
      return;
    }

    setLoading(true);
    setError('');
    setTestResult([]);

    try {
      const response = await fetch('/api/ai/generate-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testType,
          categories: selectedCategories,
          numQuestions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: TestResult = await response.json();
      setTestResult(data.test);
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Practice Tests</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="testType" style={{ display: 'block', marginBottom: '5px' }}>
          Test Type (DECA Cluster):
        </label>
        <select
          id="testType"
          value={testType}
          onChange={(e) => setTestType(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
        >
          <option value="">Select a test type...</option>
          {testTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <label style={{ display: 'block', marginBottom: '10px' }}>Categories:</label>
        <div style={{ marginBottom: '15px', maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
          {categoriesList.map((category) => (
            <div key={category} style={{ marginBottom: '5px' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={(e) => handleCategoryChange(category, e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                {category}
              </label>
            </div>
          ))}
        </div>

        <label htmlFor="numQuestions" style={{ display: 'block', marginBottom: '5px' }}>
          Number of Questions:
        </label>
        <input
          id="numQuestions"
          type="number"
          min="1"
          max="50"
          value={numQuestions}
          onChange={(e) => setNumQuestions(parseInt(e.target.value) || 1)}
          style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Loading...' : 'Generate'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {testResult.length > 0 && (
        <div>
          <h2>Generated Test Questions</h2>
          {testResult.map((item, index) => (
            <div key={index} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <h3>Question {index + 1}</h3>
              <p style={{ marginBottom: '10px' }}>{item.question}</p>
              <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
                <strong>Answer:</strong> {item.answer}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}