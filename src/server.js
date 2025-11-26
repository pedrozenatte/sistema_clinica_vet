import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import authRouter from './routes/auth.js';
import clientesRouter from './routes/clientes.js';
import agendamentosRouter from './routes/agendamentos.js';
import atendimentosRouter from './routes/atendimentos.js';
import dashboardRouter from './routes/dashboard.js';
import { attachUserIfPresent, requireAuth, requirePageAuth } from './middlewares/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);

app.use(attachUserIfPresent);
app.use(requirePageAuth);
app.use('/api', requireAuth);

app.use('/api/clientes', clientesRouter);
app.use('/api/agendamentos', agendamentosRouter);
app.use('/api/atendimentos', atendimentosRouter);
app.use('/api/dashboard', dashboardRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

app.use(express.static(publicDir));

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint não encontrado.' });
  }
  return res.redirect('/pages/dashboard.html');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado em http://localhost:${PORT}`);
});
