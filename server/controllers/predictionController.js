import * as mlService from '../services/mlService.js';

/**
 * Validates student input and dynamic subjects.
 * Follows Section 21 constraints:
 * - Attendance cannot be negative
 * - Attended cannot exceed conducted
 * - Conducted must be greater than 0
 * - Subject name cannot be empty
 * - At least one subject required
 * - Attendance cannot exceed 100%
 */
export const validateInput = (subjects) => {
  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    throw new Error('At least one subject is required.');
  }

  for (let i = 0; i < subjects.length; i++) {
    const sub = subjects[i];
    const indexStr = `Subject #${i + 1}`;

    if (!sub.name || typeof sub.name !== 'string' || sub.name.trim() === '') {
      throw new Error(`${indexStr}: Subject name cannot be empty.`);
    }

    const conducted = Number(sub.conducted);
    const attended = Number(sub.attended);

    if (isNaN(conducted) || isNaN(attended)) {
      throw new Error(`${indexStr} ("${sub.name}"): Classes conducted and attended must be valid numbers.`);
    }

    if (conducted <= 0) {
      throw new Error(`${indexStr} ("${sub.name}"): Classes conducted must be greater than 0.`);
    }

    if (attended < 0) {
      throw new Error(`${indexStr} ("${sub.name}"): Classes attended cannot be negative.`);
    }

    if (attended > conducted) {
      throw new Error(`${indexStr} ("${sub.name}"): Classes attended (${attended}) cannot exceed classes conducted (${conducted}).`);
    }

    const pct = (attended / conducted) * 100;
    if (pct > 100) {
      throw new Error(`${indexStr} ("${sub.name}"): Attendance percentage cannot exceed 100%.`);
    }
  }
};

/**
 * Maps student's academic year and semester to cohort.
 * Does NOT use department!
 * E.g., year 3, sem 1 -> '3-1'
 */
export const mapStudentCohort = (year, semester) => {
  // Extract digits if provided as strings like "3rd Year", "Year 3", "Semester 1", etc.
  const y = String(year || '3').replace(/\D/g, '') || '3';
  const s = String(semester || '1').replace(/\D/g, '') || '1';
  return `${y}-${s}`;
};

/**
 * Automatic Feature Engineering (Section 6)
 * Calculates all 11 statistical features + cohort
 */
export const engineerFeatures = (subjects, studentInfo = {}) => {
  let totalConducted = 0;
  let totalAttended = 0;
  const percentages = [];
  const subjectBreakdown = [];

  subjects.forEach(sub => {
    const conducted = Number(sub.conducted);
    const attended = Number(sub.attended);
    const pct = Math.round((attended / conducted) * 10000) / 100;

    totalConducted += conducted;
    totalAttended += attended;
    percentages.push(pct);

    // Rule-based subject risk status (Section 14)
    let status = 'Safe';
    if (pct < 65) {
      status = 'High Risk';
    } else if (pct < 75) {
      status = 'At Risk';
    }

    subjectBreakdown.push({
      name: sub.name.trim(),
      conducted,
      attended,
      missed: conducted - attended,
      percentage: pct,
      status
    });
  });

  const totalMissed = totalConducted - totalAttended;
  const overallAttendance = Math.round((totalAttended / totalConducted) * 10000) / 100;

  // Average subject attendance
  const sumPct = percentages.reduce((acc, val) => acc + val, 0);
  const avgSubjectAttendance = Math.round((sumPct / percentages.length) * 100) / 100;

  // Min and max
  const minSubjectAttendance = Math.round(Math.min(...percentages) * 100) / 100;
  const maxSubjectAttendance = Math.round(Math.max(...percentages) * 100) / 100;

  // Standard deviation
  const variance = percentages.reduce((acc, val) => acc + Math.pow(val - avgSubjectAttendance, 2), 0) / percentages.length;
  const stdSubjectAttendance = Math.round(Math.sqrt(variance) * 100) / 100;

  // Count below 75 and 65
  const subjectsBelow75 = percentages.filter(pct => pct < 75).length;
  const subjectsBelow65 = percentages.filter(pct => pct < 65).length;
  const subjectsCount = subjects.length;

  // Map cohort from year and semester (department is NOT an ML feature)
  const cohort = mapStudentCohort(studentInfo.year, studentInfo.semester);

  const mlFeatures = {
    july_overall_attendance: overallAttendance,
    july_total_conducted: totalConducted,
    july_total_attended: totalAttended,
    july_total_missed: totalMissed,
    july_avg_subject_attendance: avgSubjectAttendance,
    july_min_subject_attendance: minSubjectAttendance,
    july_max_subject_attendance: maxSubjectAttendance,
    july_std_subject_attendance: stdSubjectAttendance,
    july_subjects_below_75: subjectsBelow75,
    july_subjects_below_65: subjectsBelow65,
    july_subjects_count: subjectsCount,
    cohort: cohort
  };

  return {
    mlFeatures,
    subjectBreakdown,
    summary: {
      overallAttendance,
      totalConducted,
      totalAttended,
      totalMissed,
      avgSubjectAttendance,
      minSubjectAttendance,
      maxSubjectAttendance,
      stdSubjectAttendance,
      subjectsBelow75,
      subjectsBelow65,
      subjectsCount,
      cohort
    }
  };
};

/**
 * Controller: Check health of Node.js backend & ML service
 */
export const getHealth = async (req, res) => {
  try {
    const mlHealth = await mlService.checkMlHealth();
    return res.status(200).json({
      status: 'ok',
      service: 'smart-attendance-backend',
      ml_service: mlHealth
    });
  } catch (error) {
    return res.status(200).json({
      status: 'degraded',
      service: 'smart-attendance-backend',
      ml_service: 'offline',
      error: error.message
    });
  }
};

/**
 * Controller: Predict Attendance
 */
export const predictAttendance = async (req, res) => {
  try {
    const { student = {}, subjects } = req.body;

    validateInput(subjects);

    // Feature engineering
    const { mlFeatures, subjectBreakdown, summary } = engineerFeatures(subjects, student);

    // Call ML service
    const mlResult = await mlService.getMlPrediction(mlFeatures);

    // Also compute maximum safe leave simulation so the dashboard has it right away
    let leaveSim = null;
    try {
      leaveSim = await mlService.getLeaveSimulation(mlFeatures, 0);
    } catch (e) {
      console.warn('Could not compute initial leave simulation:', e.message);
    }

    return res.status(200).json({
      success: true,
      student_info: {
        name: student.name || 'Anonymous Student',
        roll_number: student.roll_number || 'N/A',
        department: student.department || 'General',
        year: student.year || '3',
        semester: student.semester || '1',
        section: student.section || 'A'
      },
      current_attendance: summary.overallAttendance,
      september_prediction: mlResult.september_prediction,
      october_forecast: mlResult.october_forecast,
      risk_level: mlResult.risk_level,
      risk_explanation: 'Risk level is determined using attendance thresholds after the ML prediction.',
      maximum_safe_leave: leaveSim ? leaveSim.maximum_safe_leave : 0,
      max_safe_leave_message: leaveSim ? leaveSim.max_safe_leave_message : 'Based on the model forecast.',
      subject_breakdown: subjectBreakdown,
      feature_summary: summary,
      leave_trajectory: leaveSim ? leaveSim.trajectory : []
    });
  } catch (error) {
    console.error('Error in predictAttendance controller:', error.message);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Controller: Leave Impact Simulation
 */
export const simulateLeave = async (req, res) => {
  try {
    const { student = {}, subjects, classes_to_miss = 0 } = req.body;

    const missedCount = Number(classes_to_miss);
    if (isNaN(missedCount) || missedCount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Classes missed cannot be negative.'
      });
    }

    validateInput(subjects);

    // Feature engineering
    const { mlFeatures } = engineerFeatures(subjects, student);

    // Call ML service for leave simulation
    const simulationResult = await mlService.getLeaveSimulation(mlFeatures, missedCount);

    return res.status(200).json({
      success: true,
      ...simulationResult
    });
  } catch (error) {
    console.error('Error in simulateLeave controller:', error.message);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Controller: Model Info & Evaluation Metrics
 */
export const getModelDetails = async (req, res) => {
  try {
    const info = await mlService.getModelInfo();
    return res.status(200).json({
      success: true,
      data: info
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      error: error.message
    });
  }
};
