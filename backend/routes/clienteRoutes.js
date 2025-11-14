const express = require('express');
const clienteController = require('../controllers/clienteController');

const router = express.Router();

// Rotas para clientes
router.post('/', clienteController.createCliente);
router.get('/', clienteController.getAllClientes);
router.get('/search', clienteController.searchClienteByCodigo);
router.get('/:id', clienteController.getClienteById);
router.put('/:id', clienteController.updateCliente);
router.delete('/:id', clienteController.deleteCliente);

module.exports = router;
