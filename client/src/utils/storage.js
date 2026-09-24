const STORAGE_KEY = 'smart_attendance_history';

export const getStoredPredictions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading localStorage predictions:', e);
    return [];
  }
};

export const savePredictionToStorage = (predictionData) => {
  try {
    const existing = getStoredPredictions();
    const newEntry = {
      id: 'session_' + Date.now(),
      timestamp: new Date().toISOString(),
      student_info: predictionData.student_info,
      current_attendance: predictionData.current_attendance,
      september_prediction: predictionData.september_prediction,
      october_forecast: predictionData.october_forecast,
      risk_level: predictionData.risk_level,
      maximum_safe_leave: predictionData.maximum_safe_leave,
      subject_breakdown: predictionData.subject_breakdown,
      feature_summary: predictionData.feature_summary,
      leave_trajectory: predictionData.leave_trajectory
    };

    // Keep the most recent 20 sessions
    const updated = [newEntry, ...existing.filter(item => item.id !== newEntry.id)].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  } catch (e) {
    console.error('Error saving prediction to localStorage:', e);
    return null;
  }
};

export const deleteStoredPrediction = (id) => {
  try {
    const existing = getStoredPredictions();
    const updated = existing.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error deleting prediction from localStorage:', e);
    return [];
  }
};

export const clearAllStoredPredictions = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing localStorage:', e);
  }
};
