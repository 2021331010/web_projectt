const { Quiz, Question, QuizAttempt, User } = require('../models');

// Get all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.findAll({
      where: { isActive: true },
      include: [{
        model: Question,
        as: 'questions',
        attributes: ['id']
      }],
      attributes: ['id', 'title', 'description', 'category', 'duration', 'passingScore']
    });

    const quizzesWithCount = quizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      duration: quiz.duration,
      passingScore: quiz.passingScore,
      totalQuestions: quiz.questions.length
    }));

    res.json({
      success: true,
      data: quizzesWithCount
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quizzes',
      error: error.message
    });
  }
};

// Get single quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByPk(id, {
      include: [{
        model: Question,
        as: 'questions',
        attributes: ['id', 'questionText', 'questionType', 'options', 'points']
      }]
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz',
      error: error.message
    });
  }
};

// Start quiz attempt
exports.startQuizAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // থেকে আসবে auth middleware থেকে

    const quiz = await Quiz.findByPk(id, {
      include: [{
        model: Question,
        as: 'questions'
      }]
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const attempt = await QuizAttempt.create({
      userId,
      quizId: id,
      totalQuestions: quiz.questions.length,
      status: 'in-progress'
    });

    res.json({
      success: true,
      message: 'Quiz attempt started',
      data: {
        attemptId: attempt.id,
        startTime: attempt.startTime,
        duration: quiz.duration
      }
    });
  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting quiz attempt',
      error: error.message
    });
  }
};

// Submit quiz
exports.submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { attemptId, answers } = req.body; // answers = [{questionId: 1, selectedOption: 2}, ...]
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({
      where: { id: attemptId, userId, quizId: id, status: 'in-progress' }
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found or already completed'
      });
    }

    // Get all questions with correct answers
    const questions = await Question.findAll({
      where: { quizId: id },
      attributes: ['id', 'correctAnswer', 'points', 'questionText', 'options', 'explanation']
    });

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const results = questions.map(question => {
      totalPoints += question.points;
      const userAnswer = answers.find(a => a.questionId === question.id);
      const isCorrect = userAnswer && userAnswer.selectedOption === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
        earnedPoints += question.points;
      }

      return {
        questionId: question.id,
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswer ? userAnswer.selectedOption : null,
        isCorrect,
        explanation: question.explanation,
        points: question.points
      };
    });

    const scorePercentage = Math.round((earnedPoints / totalPoints) * 100);

    // Update attempt
    await attempt.update({
      endTime: new Date(),
      score: scorePercentage,
      correctAnswers,
      answers: answers,
      status: 'completed'
    });

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        attemptId: attempt.id,
        score: scorePercentage,
        correctAnswers,
        totalQuestions: questions.length,
        earnedPoints,
        totalPoints,
        results
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz',
      error: error.message
    });
  }
};

// Get quiz results
exports.getQuizResults = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({
      where: { id: attemptId, userId },
      include: [{
        model: Quiz,
        as: 'quiz',
        attributes: ['title', 'category', 'passingScore']
      }]
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    if (attempt.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Quiz not yet completed'
      });
    }

    const questions = await Question.findAll({
      where: { quizId: attempt.quizId },
      attributes: ['id', 'questionText', 'options', 'correctAnswer', 'explanation']
    });

    const results = questions.map(question => {
      const userAnswer = attempt.answers.find(a => a.questionId === question.id);
      return {
        questionId: question.id,
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswer ? userAnswer.selectedOption : null,
        isCorrect: userAnswer && userAnswer.selectedOption === question.correctAnswer,
        explanation: question.explanation
      };
    });

    res.json({
      success: true,
      data: {
        quizTitle: attempt.quiz.title,
        category: attempt.quiz.category,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        passingScore: attempt.quiz.passingScore,
        passed: attempt.score >= attempt.quiz.passingScore,
        startTime: attempt.startTime,
        endTime: attempt.endTime,
        results
      }
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz results',
      error: error.message
    });
  }
};

// Create new quiz (Admin only)
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, category, duration, passingScore, questions } = req.body;

    const quiz = await Quiz.create({
      title,
      description,
      category,
      duration: duration || 600,
      passingScore: passingScore || 60
    });

    if (questions && questions.length > 0) {
      const questionData = questions.map(q => ({
        quizId: quiz.id,
        questionText: q.questionText,
        questionType: q.questionType || 'multiple-choice',
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points || 1
      }));

      await Question.bulkCreate(questionData);
    }

    const createdQuiz = await Quiz.findByPk(quiz.id, {
      include: [{
        model: Question,
        as: 'questions'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: createdQuiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating quiz',
      error: error.message
    });
  }
};