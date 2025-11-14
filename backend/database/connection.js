const { Sequelize } = require('sequelize');
const path = require('path');

// Configurar o Sequelize com SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database/clinica.db'),
  logging: false, // Mude para console.log para ver as queries SQL
  define: {
    timestamps: true,
    underscored: true,
  },
});

module.exports = sequelize;
