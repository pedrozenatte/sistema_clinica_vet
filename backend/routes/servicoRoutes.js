const express = require('express');
const servicoController = require('../controllers/servicoController');

const router = express.Router();

// Rotas para serviços
router.post('/', servicoController.createServico);
router.get('/', servicoController.getAllServicos);
router.get('/:id', servicoController.getServicoById);
router.put('/:id', servicoController.updateServico);
router.delete('/:id', servicoController.deleteServico);

module.exports = router;
