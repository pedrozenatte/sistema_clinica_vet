const express = require('express');
const router = express.Router();
const atendimentoController = require('../controllers/atendimentoController');

// Rotas
router.post('/', atendimentoController.createAtendimento);
router.get('/', atendimentoController.getAllAtendimentos);
router.get('/:id', atendimentoController.getAtendimentoById);
router.put('/:id', atendimentoController.updateAtendimento);
router.delete('/:id', atendimentoController.deleteAtendimento);
router.get('/cliente/:cliente_id', atendimentoController.getAtendimentosByCliente);
router.get('/veterinario/:veterinario_id', atendimentoController.getAtendimentosByVeterinario);

module.exports = router;
