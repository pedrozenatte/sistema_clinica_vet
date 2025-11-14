const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./database/index');
const clienteRoutes = require('./routes/clienteRoutes');
const petRoutes = require('./routes/petRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');
const veterinarioRoutes = require('./routes/veterinarioRoutes');
const servicoRoutes = require('./routes/servicoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, '../clinica')));

// Rotas da API
app.use('/api/clientes', clienteRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/veterinarios', veterinarioRoutes);
app.use('/api/servicos', servicoRoutes);

// Rota raiz para servir o dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../clinica/dashboard.html'));
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor', detalhes: err.message });
});

// Inicializar banco de dados e iniciar servidor
(async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`✓ Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
})();

module.exports = app;
