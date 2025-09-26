import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import geminiService from '../services/geminiService.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AISymptomAnalysis:
 *       type: object
 *       properties:
 *         symptoms:
 *           type: array
 *           items:
 *             type: string
 *         additionalInfo:
 *           type: string
 *     AIEducationQuery:
 *       type: object
 *       properties:
 *         question:
 *           type: string
 *           required: true
 */

/**
 * @swagger
 * /api/ai/status:
 *   get:
 *     summary: Check AI service status
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI service status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 configured:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.get('/status', protect, async (req, res) => {
  try {
    const isConfigured = geminiService.isConfigured();
    
    res.json({
      success: true,
      configured: isConfigured,
      message: isConfigured 
        ? 'Gemini AI is configured and ready' 
        : 'Gemini AI is not configured. Please set GEMINI_API_KEY environment variable.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check AI status'
    });
  }
});

/**
 * @swagger
 * /api/ai/diagnose:
 *   post:
 *     summary: Get AI medical diagnosis
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AISymptomAnalysis'
 *     responses:
 *       200:
 *         description: AI diagnosis response
 *       400:
 *         description: Invalid input
 *       503:
 *         description: AI service unavailable
 */
router.post('/diagnose', 
  protect,
  authorize('patient', 'doctor', 'nurse'),
  [
    body('symptoms')
      .isArray({ min: 1 })
      .withMessage('Symptoms array is required and must not be empty'),
    body('additionalInfo')
      .optional()
      .isString()
      .withMessage('Additional info must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { symptoms, additionalInfo = '' } = req.body;

      if (!geminiService.isConfigured()) {
        return res.status(503).json({
          success: false,
          error: 'AI service is not configured',
          fallback: true
        });
      }

      const diagnosis = await geminiService.getMedicalDiagnosis(symptoms, additionalInfo);

      res.json({
        success: true,
        data: {
          diagnosis,
          symptoms,
          additionalInfo,
          timestamp: new Date().toISOString(),
          aiProvider: 'Gemini'
        }
      });

    } catch (error) {
      console.error('AI Diagnosis Error:', error);
      res.status(503).json({
        success: false,
        error: error.message || 'AI diagnosis service temporarily unavailable',
        fallback: true
      });
    }
  }
);

/**
 * @swagger
 * /api/ai/analyze-symptoms:
 *   post:
 *     summary: Get structured symptom analysis
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AISymptomAnalysis'
 *     responses:
 *       200:
 *         description: Structured symptom analysis
 */
router.post('/analyze-symptoms',
  protect,
  authorize('patient', 'doctor', 'nurse'),
  [
    body('symptoms')
      .isArray({ min: 1 })
      .withMessage('Symptoms array is required'),
    body('additionalInfo')
      .optional()
      .isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { symptoms, additionalInfo = '' } = req.body;

      if (!geminiService.isConfigured()) {
        return res.status(503).json({
          success: false,
          error: 'AI service is not configured',
          fallback: true
        });
      }

      const analysis = await geminiService.getSymptomAnalysis(symptoms, additionalInfo);

      res.json({
        success: true,
        data: {
          ...analysis,
          symptoms,
          additionalInfo,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('AI Analysis Error:', error);
      res.status(503).json({
        success: false,
        error: error.message || 'AI analysis service temporarily unavailable',
        fallback: true
      });
    }
  }
);

/**
 * @swagger
 * /api/ai/education:
 *   post:
 *     summary: Get health education from AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIEducationQuery'
 *     responses:
 *       200:
 *         description: Health education response
 */
router.post('/education',
  protect,
  [
    body('question')
      .notEmpty()
      .withMessage('Question is required')
      .isLength({ min: 5, max: 500 })
      .withMessage('Question must be between 5 and 500 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { question } = req.body;

      if (!geminiService.isConfigured()) {
        return res.status(503).json({
          success: false,
          error: 'AI service is not configured',
          fallback: true
        });
      }

      const response = await geminiService.getHealthEducation(question);

      res.json({
        success: true,
        data: {
          question,
          response,
          timestamp: new Date().toISOString(),
          aiProvider: 'Gemini'
        }
      });

    } catch (error) {
      console.error('AI Education Error:', error);
      res.status(503).json({
        success: false,
        error: error.message || 'AI education service temporarily unavailable',
        fallback: true
      });
    }
  }
);

export default router;
