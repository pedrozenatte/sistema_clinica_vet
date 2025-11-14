const sequelize = require('./connection');

const Cliente = require('../models/Cliente');
const Pet = require('../models/Pet');
const Veterinario = require('../models/Veterinario');
const Servico = require('../models/Servico');
const Agendamento = require('../models/Agendamento');

// Definir relacionamentos
Cliente.hasMany(Pet, { foreignKey: 'cliente_id', as: 'pets' });
Pet.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

Agendamento.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Agendamento.belongsTo(Pet, { foreignKey: 'pet_id', as: 'pet' });
Agendamento.belongsTo(Veterinario, { foreignKey: 'veterinario_id', as: 'veterinario' });
Agendamento.belongsTo(Servico, { foreignKey: 'servico_id', as: 'servico' });

Cliente.hasMany(Agendamento, { foreignKey: 'cliente_id', as: 'agendamentos' });
Pet.hasMany(Agendamento, { foreignKey: 'pet_id', as: 'agendamentos' });
Veterinario.hasMany(Agendamento, { foreignKey: 'veterinario_id', as: 'agendamentos' });
Servico.hasMany(Agendamento, { foreignKey: 'servico_id', as: 'agendamentos' });

// Sincronizar o banco de dados
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexão com o banco de dados estabelecida');
    
    await sequelize.sync({ alter: false });
    console.log('✓ Banco de dados sincronizado');
  } catch (error) {
    console.error('✗ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  initializeDatabase,
  Cliente,
  Pet,
  Veterinario,
  Servico,
  Agendamento,
};
