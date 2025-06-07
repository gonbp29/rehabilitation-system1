import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { ExerciseType } from '../types';

class Exercise extends Model implements ExerciseType {
  public id!: string;
  public name!: string;
  public description?: string;
  public videoUrl?: string;
  public instructions?: string;
  public duration?: number;
  public repetitions?: number;
  public sets?: number;
  public difficulty?: 'beginner' | 'intermediate' | 'advanced';
  public type?: 'squat' | 'plank' | 'pushup' | 'other';
  public category?: 'core' | 'upper' | 'lower' | 'full';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Exercise.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    videoUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    repetitions: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sets: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    difficulty: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('squat', 'plank', 'pushup', 'other'),
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('core', 'upper', 'lower', 'full'),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Exercise',
  }
);

export default Exercise; 