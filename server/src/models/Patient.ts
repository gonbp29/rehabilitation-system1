import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Therapist from './Therapist';

class Patient extends Model {
  public id!: string;
  public userId!: string;
  public therapistId?: string;
  public condition?: string;
  public status!: 'active' | 'inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Patient.init(
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
    therapistId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: Therapist,
        key: 'id',
      },
    },
    condition: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    modelName: 'Patient',
  }
);

// Define associations
Patient.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Patient, { foreignKey: 'userId' });

Patient.belongsTo(Therapist, { foreignKey: 'therapistId' });
Therapist.hasMany(Patient, { foreignKey: 'therapistId' });

export default Patient; 