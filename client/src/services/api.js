const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const checkHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
};

export const predictAttendance = async (student, subjects) => {
  const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ student, subjects })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Prediction service is currently unavailable. Please try again.');
  }

  return data;
};

export const simulateLeave = async (student, subjects, classesToMiss) => {
  const response = await fetch(`${API_BASE_URL}/api/simulate-leave`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      student,
      subjects,
      classes_to_miss: classesToMiss
    })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Prediction service is currently unavailable. Please try again.');
  }

  return data;
};

export const getModelInfo = async () => {
  const response = await fetch(`${API_BASE_URL}/api/model-info`);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Could not load model info.');
  }
  return data.data;
};
