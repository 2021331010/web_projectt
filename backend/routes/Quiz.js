const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protect, adminAuth } = require('../middleware/Auth'); // ⭐ adminAuth import

// Public routes
router.get('/', quizController.getAllQuizzes);
router.get('/:id', quizController.getQuizById);

// Protected routes (Login required)
router.post('/:id/start', protect, quizController.startQuizAttempt);
router.post('/:id/submit', protect, quizController.submitQuiz);
router.get('/attempt/:attemptId/results', protect, quizController.getQuizResults);

// Admin routes (Admin only)
router.post('/create', protect, adminAuth, quizController.createQuiz); // ⭐ adminAuth add

module.exports = router;