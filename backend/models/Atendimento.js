const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Atendimento = sequelize.define('Atendimento', {
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
      onDelete: 'SET NULL',
    },
    data_atendimento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM('Consulta', 'Retorno', 'Emergência', 'Check-up'),
      defaultValue: 'Consulta',
    },
    status: {
      type: DataTypes.ENUM('Em atendimento', 'Finalizado', 'Cancelado'),
      defaultValue: 'Em atendimento',
    },
    // Anamnese
    anamnese: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Exame Físico
    peso: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    temperatura: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true,
    },
    frequencia_cardiaca: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    frequencia_respiratoria: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hidratacao: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mucosas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    exame_obs: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Diagnóstico
    hipoteses: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    exames_solicitados: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    solicitar_retorno: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Prescrição
    prescricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'atendimentos',
    timestamps: true,
  });

module.exports = Atendimento;
