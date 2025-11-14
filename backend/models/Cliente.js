const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  codigo: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  tipo_pessoa: {
    type: DataTypes.ENUM('Física', 'Jurídica'),
    allowNull: false,
    defaultValue: 'Física',
  },
  nome: {
    type: DataTypes.STRING,
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
  sexo: {
    type: DataTypes.ENUM('M', 'F', 'Outro'),
  },
  data_nascimento: {
    type: DataTypes.DATE,
  },
  cpf_cnpj: {
    type: DataTypes.STRING,
    unique: true,
  },
  rua: {
    type: DataTypes.STRING,
  },
  numero: {
    type: DataTypes.STRING,
  },
  complemento: {
    type: DataTypes.STRING,
  },
  bairro: {
    type: DataTypes.STRING,
  },
  cidade: {
    type: DataTypes.STRING,
  },
  estado: {
    type: DataTypes.STRING,
  },
  cep: {
    type: DataTypes.STRING,
  },
  situacao: {
    type: DataTypes.ENUM('Liberado', 'Inativo', 'Bloqueado'),
    defaultValue: 'Liberado',
  },
}, {
  tableName: 'clientes',
  timestamps: true,
});

module.exports = Cliente;
