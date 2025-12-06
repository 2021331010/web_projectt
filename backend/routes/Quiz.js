const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/Auth');
const {
  createQuiz,
  addQuestion,
  getAllQuizzes,
  getQuizById,
  startQuiz,
  submitQuiz,
  getMyAttempts
} = require('../controllers/QuizController');

// Public routes
router.get('/', getAllQuizzes);
router.get('/:id', getQuizById);

// Protected routes
router.post('/', protect, createQuiz); // Admin only (can add role check later)
router.post('/:quizId/question', protect, addQuestion); // Admin only
router.post('/:id/start', protect, startQuiz);
router.post('/attempt/:attemptId/submit', protect, submitQuiz);
router.get('/my/attempts', protect, getMyAttempts);

module.exports = router;