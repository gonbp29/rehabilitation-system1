import { Sequelize } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rehabilitation_system',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: true
  }
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection to MySQL database has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the MySQL database:', error);
  });

export default sequelize; 