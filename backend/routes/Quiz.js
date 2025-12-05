const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protect, adminAuth } = require('../middleware/Auth'); // ⭐ adminAuth import
const { Question } = require('../models'); // ⭐ Question model import

// Admin routes (Admin only) - keep before :id route
router.post('/create', protect, adminAuth, quizController.createQuiz); // ⭐ adminAuth added

// ⭐ New route: Add question to quiz (Admin only)
router.post('/questions/add', protect, adminAuth, async (req, res) => {
  try {
    const { quizId, questionText, questionType, options, correctAnswer, explanation, points } = req.body;

    const question = await Question.create({
      quizId,
      questionText,
      questionType,
      options,
      correctAnswer,
      explanation,
      points
    });

    res.status(201).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public routes
router.get('/', quizController.getAllQuizzes);
router.get('/:id', quizController.getQuizById);

// Protected routes (Login required)
router.post('/:id/start', protect, quizController.startQuizAttempt);
router.post('/:id/submit', protect, quizController.submitQuiz);
router.get('/attempt/:attemptId/results', protect, quizController.getQuizResults);

module.exports = router;
