import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const checkMlHealth = async () => {
  try {
    const response = await client.get('/health');
    return response.data;
  } catch (error) {
    console.error('ML service health check failed:', error.message);
    throw new Error('Prediction service is currently unavailable. Please try again.');
  }
};

export const getMlPrediction = async (features) => {
  try {
    const response = await client.post('/predict', features);
    return response.data;
  } catch (error) {
    console.error('ML predict request failed:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Prediction service is currently unavailable. Please try again.');
  }
};

export const getLeaveSimulation = async (features, classesToMiss) => {
  try {
    const response = await client.post('/simulate-leave', {
      features,
      classes_to_miss: classesToMiss
    });
    return response.data;
  } catch (error) {
    console.error('ML leave simulation failed:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Prediction service is currently unavailable. Please try again.');
  }
};

export const getModelInfo = async () => {
  try {
    const response = await client.get('/model-info');
    return response.data;
  } catch (error) {
    console.error('ML model info request failed:', error.message);
    throw new Error('Prediction service is currently unavailable. Please try again.');
  }
};
