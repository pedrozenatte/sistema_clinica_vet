const { Pet, Cliente } = require('../database/index');

// Criar novo pet
exports.createPet = async (req, res) => {
  try {
    const { cliente_id, nome, raca, especie, sexo, data_nascimento, peso, cor, microchip, alergias, observacoes } = req.body;

    if (!cliente_id || !nome || !especie) {
      return res.status(400).json({ erro: 'Cliente ID, nome e espécie são obrigatórios' });
    }

    const cliente = await Cliente.findByPk(cliente_id);
    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    const pet = await Pet.create({
      cliente_id,
      nome,
      raca,
      especie,
      sexo,
      data_nascimento,
      peso,
      cor,
      microchip,
      alergias,
      observacoes,
    });

    res.status(201).json({ mensagem: 'Pet criado com sucesso', pet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar pet', detalhes: error.message });
  }
};

// Obter todos os pets
exports.getAllPets = async (req, res) => {
  try {
    const pets = await Pet.findAll({
      include: {
        association: 'cliente',
        attributes: ['id', 'nome', 'email', 'telefone'],
      },
      order: [['nome', 'ASC']],
    });

    res.json(pets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar pets', detalhes: error.message });
  }
};

// Obter pets de um cliente
exports.getPetsByCliente = async (req, res) => {
  try {
    const { cliente_id } = req.params;

    const pets = await Pet.findAll({
      where: { cliente_id },
      order: [['nome', 'ASC']],
    });

    res.json(pets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar pets do cliente', detalhes: error.message });
  }
};

// Obter pet por ID
exports.getPetById = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findByPk(id, {
      include: {
        association: 'cliente',
        attributes: ['id', 'nome', 'email', 'telefone'],
      },
    });

    if (!pet) {
      return res.status(404).json({ erro: 'Pet não encontrado' });
    }

    res.json(pet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar pet', detalhes: error.message });
  }
};

// Atualizar pet
exports.updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, raca, especie, sexo, data_nascimento, peso, cor, microchip, alergias, observacoes } = req.body;

    const pet = await Pet.findByPk(id);
    if (!pet) {
      return res.status(404).json({ erro: 'Pet não encontrado' });
    }

    await pet.update({
      nome: nome || pet.nome,
      raca: raca || pet.raca,
      especie: especie || pet.especie,
      sexo: sexo || pet.sexo,
      data_nascimento: data_nascimento || pet.data_nascimento,
      peso: peso || pet.peso,
      cor: cor || pet.cor,
      microchip: microchip || pet.microchip,
      alergias: alergias || pet.alergias,
      observacoes: observacoes || pet.observacoes,
    });

    res.json({ mensagem: 'Pet atualizado com sucesso', pet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar pet', detalhes: error.message });
  }
};

// Deletar pet
exports.deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findByPk(id);

    if (!pet) {
      return res.status(404).json({ erro: 'Pet não encontrado' });
    }

    await pet.destroy();
    res.json({ mensagem: 'Pet deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao deletar pet', detalhes: error.message });
  }
};
