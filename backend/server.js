const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ===============================
// 🔥 Load All Models (VERY IMPORTANT)
// ===============================
require('./models');

// ===============================
// Middleware
// ===============================

// CORS Configuration
app.use(cors({
  origin: '*',
  credentials: true
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (Only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📍 ${req.method} ${req.path}`);
    next();
  });
}

// ===============================
// 🛣️ API Routes
// ===============================

// Auth Routes
app.use('/api/auth', require('./routes/Auth'));

// Root Route
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
      health: 'GET /api/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// ===============================
// 🚫 Error Handling
// ===============================

// 404 Handler (Must be after all routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Global Error Handler
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

// ===============================
// 🚀 Start Server
// ===============================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();

    // Start Express Server
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
      console.log('   POST   /api/auth/register');
      console.log('   POST   /api/auth/login');
      console.log('   GET    /api/auth/me');
      console.log('   POST   /api/auth/logout');
      console.log('   GET    /api/health');
      console.log('==========================================');
      console.log('');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// ===============================
// 🛡️ Process Error Handlers
// ===============================

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  console.error('💥 Shutting down server...');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('💥 Shutting down server...');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});