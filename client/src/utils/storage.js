const STORAGE_KEY = 'smart_attendance_history';


// ==========================================
// GET ALL STORED PREDICTIONS
// ==========================================

export const getStoredPredictions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    return raw
      ? JSON.parse(raw)
      : [];

  } catch (error) {
    console.error(
      'Error reading localStorage predictions:',
      error
    );

    return [];
  }
};


// ==========================================
// SAVE PREDICTION
// ==========================================

export const savePredictionToStorage = (predictionData) => {
  try {

    const existing = getStoredPredictions();

    const newEntry = {
      id: 'session_' + Date.now(),

      timestamp: new Date().toISOString(),

      student_info:
        predictionData?.student_info || null,

      current_attendance:
        predictionData?.current_attendance || null,

      september_prediction:
        predictionData?.september_prediction || null,

      october_forecast:
        predictionData?.october_forecast || null,

      risk_level:
        predictionData?.risk_level || null,

      maximum_safe_leave:
        predictionData?.maximum_safe_leave ?? 0,

      subject_breakdown:
        predictionData?.subject_breakdown || [],

      feature_summary:
        predictionData?.feature_summary || null,

      leave_trajectory:
        predictionData?.leave_trajectory || []
    };


    // Keep only the latest 20 sessions

    const updated = [
      newEntry,
      ...existing.filter(
        item => item.id !== newEntry.id
      )
    ].slice(0, 20);


    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );


    return newEntry;

  } catch (error) {

    console.error(
      'Error saving prediction to localStorage:',
      error
    );

    return null;
  }
};


// ==========================================
// DELETE ONE PREDICTION
// ==========================================

export const deleteStoredPrediction = (id) => {
  try {

    const existing = getStoredPredictions();

    const updated = existing.filter(
      item => item.id !== id
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    return updated;

  } catch (error) {

    console.error(
      'Error deleting prediction from localStorage:',
      error
    );

    return [];
  }
};


// ==========================================
// CLEAR ALL PREDICTIONS
// ==========================================

export const clearAllStoredPredictions = () => {
  try {

    localStorage.removeItem(STORAGE_KEY);

  } catch (error) {

    console.error(
      'Error clearing localStorage:',
      error
    );
  }
};