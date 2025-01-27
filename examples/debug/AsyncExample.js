import React, { useState, useCallback, useEffect } from 'react';
import { useDebug } from '../index';

export const AsyncExample = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { updateDebugVariables } = useDebug();

  // Example of tracking async state changes
  const updateDebug = useCallback(() => {
    updateDebugVariables({
      AsyncExample: {
        requestState: {
          value: {
            loading,
            hasData: !!data,
            hasError: !!error
          },
          lastUpdated: new Date().toLocaleTimeString(),
          type: 'object'
        },
        data: {
          value: data,
          lastUpdated: new Date().toLocaleTimeString(),
          type: typeof data
        },
        error: {
          value: error?.message,
          lastUpdated: new Date().toLocaleTimeString(),
          type: typeof error
        }
      }
    });
  }, [loading, data, error, updateDebugVariables]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setData({ message: 'Data fetched successfully!' });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateDebug();
  }, [updateDebug]);

  return (
    <div className="space-y-4">
      <button
        onClick={fetchData}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
      
      {error && (
        <div className="text-red-500">
          Error: {error.message}
        </div>
      )}
      
      {data && (
        <div className="text-green-500">
          {data.message}
        </div>
      )}
    </div>
  );
};
