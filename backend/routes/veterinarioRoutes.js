const express = require('express');
const veterinarioController = require('../controllers/veterinarioController');

const router = express.Router();

// Rotas para veterinários
router.post('/', veterinarioController.createVeterinario);
router.get('/', veterinarioController.getAllVeterinarios);
router.get('/:id', veterinarioController.getVeterinarioById);
router.put('/:id', veterinarioController.updateVeterinario);
router.delete('/:id', veterinarioController.deleteVeterinario);

module.exports = router;
