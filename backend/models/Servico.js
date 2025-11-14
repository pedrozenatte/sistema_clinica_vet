const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Servico = sequelize.define('Servico', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  descricao: {
    type: DataTypes.TEXT,
  },
  duracao_minutos: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'servicos',
  timestamps: true,
});

module.exports = Servico;
