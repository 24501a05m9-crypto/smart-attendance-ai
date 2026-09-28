import { generateSynapseResponse } from '../ai/aiService.js';
import {
  validateInput,
  engineerFeatures
} from './predictionController.js';

import * as mlService from '../services/mlService.js';

export const chatWithSynapse = async (req, res) => {
  try {
    const {
      message,
      student = {},
      subjects = []
    } = req.body;

    // -----------------------------
    // Validate message
    // -----------------------------
    if (
      !message ||
      typeof message !== 'string' ||
      message.trim() === ''
    ) {
      return res.status(400).json({
        success: false,
        error: 'Message is required.'
      });
    }

    // -----------------------------
    // Validate attendance data
    // -----------------------------
    validateInput(subjects);

    // -----------------------------
    // Calculate attendance features
    // -----------------------------
    const {
      mlFeatures,
      subjectBreakdown,
      summary
    } = engineerFeatures(subjects, student);

    // -----------------------------
    // Get ML prediction
    // -----------------------------
    const mlResult = await mlService.getMlPrediction(mlFeatures);

    // -----------------------------
    // Calculate 75% requirements
    // -----------------------------
    const calculate75PercentInfo = (attended, conducted) => {
      const percentage = (attended / conducted) * 100;

      let classesNeeded = 0;
      let classesCanMiss = 0;

      if (percentage < 75) {
        classesNeeded = Math.ceil(
          (0.75 * conducted - attended) / 0.25
        );
      } else {
        classesCanMiss = Math.floor(
          (attended / 0.75) - conducted
        );
      }

      return {
        percentage: Math.round(percentage * 100) / 100,
        classesNeededToReach75: Math.max(0, classesNeeded),
        classesCanMissWhileStayingAt75: Math.max(0, classesCanMiss)
      };
    };

    const overall75 = calculate75PercentInfo(
      summary.totalAttended,
      summary.totalConducted
    );

    // -----------------------------
    // Subject-wise 75% information
    // -----------------------------
    const subjectAnalysis = subjectBreakdown.map(subject => {
      const info = calculate75PercentInfo(
        subject.attended,
        subject.conducted
      );

      return {
        ...subject,
        classesNeededToReach75: info.classesNeededToReach75,
        classesCanMissWhileStayingAt75:
          info.classesCanMissWhileStayingAt75
      };
    });

    // -----------------------------
    // Leave simulation
    // -----------------------------
    let leaveSimulation = null;

    try {
      leaveSimulation =
        await mlService.getLeaveSimulation(
          mlFeatures,
          0
        );
    } catch (error) {
      console.warn(
        'Synapse leave simulation unavailable:',
        error.message
      );
    }

    // -----------------------------
    // Complete trusted context
    // -----------------------------
    const context = {
      student: {
        name: student.name || 'Anonymous Student',
        roll_number: student.roll_number || 'N/A',
        department: student.department || 'General',
        year: student.year || '3',
        semester: student.semester || '1',
        section: student.section || 'A'
      },

      overallAttendance: {
        percentage: summary.overallAttendance,
        totalConducted: summary.totalConducted,
        totalAttended: summary.totalAttended,
        totalMissed: summary.totalMissed,

        classesNeededToReach75:
          overall75.classesNeededToReach75,

        classesCanMissWhileStayingAt75:
          overall75.classesCanMissWhileStayingAt75
      },

      subjectAnalysis,

      attendanceStatistics: {
        averageSubjectAttendance:
          summary.avgSubjectAttendance,

        minimumSubjectAttendance:
          summary.minSubjectAttendance,

        maximumSubjectAttendance:
          summary.maxSubjectAttendance,

        standardDeviation:
          summary.stdSubjectAttendance,

        subjectsBelow75:
          summary.subjectsBelow75,

        subjectsBelow65:
          summary.subjectsBelow65,

        totalSubjects:
          summary.subjectsCount
      },

      machineLearning: {
        riskLevel: mlResult.risk_level,

        septemberPrediction:
          mlResult.september_prediction,

        octoberForecast:
          mlResult.october_forecast
      },

      leaveSimulation: leaveSimulation
        ? {
            maximumSafeLeave:
              leaveSimulation.maximum_safe_leave,

            message:
              leaveSimulation.max_safe_leave_message,

            trajectory:
              leaveSimulation.trajectory
          }
        : null
    };

    // -----------------------------
    // Ask Gemini to explain
    // -----------------------------
    const answer = await generateSynapseResponse(
      message.trim(),
      context
    );

    return res.status(200).json({
      success: true,
      answer
    });

  } catch (error) {
    console.error(
      'Error in Synapse AI:',
      error.message
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        'Synapse AI is currently unavailable.'
    });
  }
};