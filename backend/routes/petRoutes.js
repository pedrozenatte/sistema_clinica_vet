const express = require('express');
const petController = require('../controllers/petController');

const router = express.Router();

// Rotas para pets
router.post('/', petController.createPet);
router.get('/', petController.getAllPets);
router.get('/cliente/:cliente_id', petController.getPetsByCliente);
router.get('/:id', petController.getPetById);
router.put('/:id', petController.updatePet);
router.delete('/:id', petController.deletePet);

module.exports = router;
