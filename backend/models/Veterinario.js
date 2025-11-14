const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Veterinario = sequelize.define('Veterinario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  crmv: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,
    },
  },
  telefone: {
    type: DataTypes.STRING,
  },
  especialidade: {
    type: DataTypes.STRING,
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'veterinarios',
  timestamps: true,
});

module.exports = Veterinario;
