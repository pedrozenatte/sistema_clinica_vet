const express = require('express');
const agendamentoController = require('../controllers/agendamentoController');

const router = express.Router();

// Rotas para agendamentos
router.post('/', agendamentoController.createAgendamento);
router.get('/', agendamentoController.getAllAgendamentos);
router.get('/:id', agendamentoController.getAgendamentoById);
router.put('/:id', agendamentoController.updateAgendamento);
router.delete('/:id', agendamentoController.deleteAgendamento);
router.get('/cliente/:cliente_id', agendamentoController.getAgendamentosByCliente);
router.get('/veterinario/:veterinario_id', agendamentoController.getAgendamentosByVeterinario);

module.exports = router;
