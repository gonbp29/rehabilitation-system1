import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import { TherapistType } from '../types';

class Therapist extends Model implements TherapistType {
  public id!: string;
  public userId!: string;
  public specialization?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Therapist.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    specialization: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Therapist',
  }
);

// Define associations
Therapist.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Therapist, { foreignKey: 'userId' });

export default Therapist; 