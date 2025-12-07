const { Quiz, Question, QuizAttempt, User } = require('../models');

// @desc    Create a new quiz (Admin only)
// @route   POST /api/quiz
// @access  Private/Admin
const createQuiz = async (req, res) => {
  try {
    const { title, description, category, difficulty, timeLimit, passingScore } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required'
      });
    }

    const quiz = await Quiz.create({
      title,
      description,
      category,
      difficulty: difficulty || 'beginner',
      timeLimit: timeLimit || 30,
      passingScore: passingScore || 60,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: { quiz }
    });

  } catch (error) {
    console.error('Create Quiz Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating quiz'
    });
  }
};

// @desc    Add question to quiz (Admin only)
// @route   POST /api/quiz/:quizId/question
// @access  Private/Admin
const addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questionText, questionType, options, correctAnswer, explanation, points } = req.body;

    if (!questionText || !options || !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Question text, options, and correct answer are required'
      });
    }

    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const question = await Question.create({
      quizId,
      questionText,
      questionType: questionType || 'multiple-choice',
      options,
      correctAnswer,
      explanation,
      points: points || 1,
      orderIndex: quiz.totalQuestions + 1
    });

    // Update quiz total questions
    await quiz.increment('totalQuestions');

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: { question }
    });

  } catch (error) {
    console.error('Add Question Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding question'
    });
  }
};

// @desc    Get all quizzes
// @route   GET /api/quiz
// @access  Public
const getAllQuizzes = async (req, res) => {
  try {
    const { category, difficulty } = req.query;

    const whereClause = { isActive: true };
    if (category) whereClause.category = category;
    if (difficulty) whereClause.difficulty = difficulty;

    const quizzes = await Quiz.findAll({
      where: whereClause,
      attributes: { exclude: ['createdBy'] },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { quizzes, count: quizzes.length }
    });

  } catch (error) {
    console.error('Get Quizzes Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quizzes'
    });
  }
};

// @desc    Get quiz by ID with questions
// @route   GET /api/quiz/:id
// @access  Public
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [{
        model: Question,
        as: 'questions',
        attributes: { exclude: ['correctAnswer', 'explanation'] }, // Hide answers
        order: [['orderIndex', 'ASC']]
      }]
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { quiz }
    });

  } catch (error) {
    console.error('Get Quiz Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz'
    });
  }
};

// @desc    Start quiz attempt
// @route   POST /api/quiz/:id/start
// @access  Private
const startQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [{
        model: Question,
        as: 'questions',
        attributes: { exclude: ['correctAnswer', 'explanation'] }
      }]
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const attempt = await QuizAttempt.create({
      quizId: quiz.id,
      userId: req.user.id,
      startTime: new Date(),
      totalQuestions: quiz.totalQuestions,
      status: 'in-progress'
    });

    res.status(201).json({
      success: true,
      message: 'Quiz started successfully',
      data: {
        attempt: {
          id: attempt.id,
          startTime: attempt.startTime,
          timeLimit: quiz.timeLimit
        },
        quiz: {
          id: quiz.id,
          title: quiz.title,
          timeLimit: quiz.timeLimit,
          totalQuestions: quiz.totalQuestions,
          questions: quiz.questions
        }
      }
    });

  } catch (error) {
    console.error('Start Quiz Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error starting quiz'
    });
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/quiz/attempt/:attemptId/submit
// @access  Private
const submitQuiz = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body; // { questionId: answer }

    const attempt = await QuizAttempt.findByPk(attemptId, {
      include: [{
        model: Quiz,
        as: 'quiz',
        include: [{
          model: Question,
          as: 'questions'
        }]
      }]
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    if (attempt.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (attempt.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Quiz already submitted'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    let totalScore = 0;
    const results = [];

    attempt.quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
        totalScore += question.points;
      }

      results.push({
        questionId: question.id,
        questionText: question.questionText,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });
    });

    const endTime = new Date();
    const timeTaken = Math.floor((endTime - new Date(attempt.startTime)) / 1000);
    const scorePercentage = Math.round((correctAnswers / attempt.totalQuestions) * 100);

    // Update attempt
    await attempt.update({
      answers,
      endTime,
      score: scorePercentage,
      correctAnswers,
      timeTaken,
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        score: scorePercentage,
        correctAnswers,
        totalQuestions: attempt.totalQuestions,
        timeTaken,
        passed: scorePercentage >= attempt.quiz.passingScore,
        results
      }
    });

  } catch (error) {
    console.error('Submit Quiz Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting quiz'
    });
  }
};

// @desc    Get user's quiz attempts
// @route   GET /api/quiz/my-attempts
// @access  Private
const getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Quiz,
        as: 'quiz',
        attributes: ['id', 'title', 'category']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { attempts, count: attempts.length }
    });

  } catch (error) {
    console.error('Get Attempts Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attempts'
    });
  }
};

module.exports = {
  createQuiz,
  addQuestion,
  getAllQuizzes,
  getQuizById,
  startQuiz,
  submitQuiz,
  getMyAttempts
};