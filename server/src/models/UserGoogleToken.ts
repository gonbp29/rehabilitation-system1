import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

class UserGoogleToken extends Model {}
UserGoogleToken.init({
  userId: { type: DataTypes.STRING, allowNull: false },
  accessToken: DataTypes.TEXT,
  refreshToken: DataTypes.TEXT,
  scope: DataTypes.TEXT,
  tokenType: DataTypes.STRING,
  expiryDate: DataTypes.BIGINT,
}, { sequelize, modelName: 'user_google_token' });

export default UserGoogleToken; 