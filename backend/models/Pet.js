const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Pet = sequelize.define('Pet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clientes',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  raca: {
    type: DataTypes.STRING,
  },
  especie: {
    type: DataTypes.ENUM('Canina', 'Felina', 'Aves', 'Outros'),
    allowNull: false,
  },
  sexo: {
    type: DataTypes.ENUM('M', 'F'),
  },
  data_nascimento: {
    type: DataTypes.DATE,
  },
  peso: {
    type: DataTypes.DECIMAL(5, 2),
  },
  cor: {
    type: DataTypes.STRING,
  },
  microchip: {
    type: DataTypes.STRING,
    unique: true,
  },
  alergias: {
    type: DataTypes.TEXT,
  },
  observacoes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'pets',
  timestamps: true,
});

module.exports = Pet;
