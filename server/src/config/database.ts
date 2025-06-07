import { Sequelize } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection to SQLite database has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the SQLite database:', error);
  });

export default sequelize; 