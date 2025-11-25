const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    
    dialectOptions: {
      charset: 'utf8mb4'
    },
    
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci'
    }
  }
);

const connectDB = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ MySQL Database Connected Successfully!');
    
    // Sync models - এখানে change করবেন
    await sequelize.sync({ alter: true }); // ⭐ First time এর জন্য
    // await sequelize.sync({ alter: true }); // পরে এটা use করবেন
    
    console.log('✅ All models synchronized with database');
    
    // Show created tables
    const [results] = await sequelize.query("SHOW TABLES");
    console.log('📋 Created Tables:', results.map(r => Object.values(r)[0]));
    
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };