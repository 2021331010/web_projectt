const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { sequelize } = require('./models');
const { connectDB } = require('./config/database');

dotenv.config();

const app = express();

require('./models');

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📍 ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/auth', require('./routes/Auth'));
app.use('/api/comments', require('./routes/Comment'));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TeachMe Anatomy API is running! 🚀',
    version: '1.0.0',
    database: 'MySQL',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout'
      },
      comments: {
        getComments: 'GET /api/comments/:articleId',
        postComment: 'POST /api/comments',
        deleteComment: 'DELETE /api/comments/:id',
        likeComment: 'POST /api/comments/:id/like'
      },
      health: 'GET /api/health'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Error Handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log('');
      console.log('==========================================');
      console.log('🚀 TeachMe Anatomy Backend Server Started');
      console.log('==========================================');
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🗄️  Database: MySQL (${process.env.DB_NAME})`);
      console.log(`🔐 JWT Enabled: Yes`);
      console.log('==========================================');
      console.log('📚 API Endpoints:');
      console.log('   AUTH:');
      console.log('   POST   /api/auth/register');
      console.log('   POST   /api/auth/login');
      console.log('   GET    /api/auth/me');
      console.log('   POST   /api/auth/logout');
      console.log('');
      console.log('   COMMENTS:');
      console.log('   GET    /api/comments/:articleId');
      console.log('   POST   /api/comments');
      console.log('   DELETE /api/comments/:id');
      console.log('   POST   /api/comments/:id/like');
      console.log('');
      console.log('   HEALTH:');
      console.log('   GET    /api/health');
      console.log('==========================================');
      console.log('');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  console.error('💥 Shutting down server...');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('💥 Shutting down server...');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});
