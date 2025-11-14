const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Agendamento = sequelize.define('Agendamento', {
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
  pet_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pets',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  veterinario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'veterinarios',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  servico_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'servicos',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  data_agendamento: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  hora_fim: {
    type: DataTypes.TIME,
  },
  status: {
    type: DataTypes.ENUM('Agendado', 'Confirmado', 'Cancelado', 'Concluído'),
    defaultValue: 'Agendado',
  },
  observacoes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'agendamentos',
  timestamps: true,
});

module.exports = Agendamento;
