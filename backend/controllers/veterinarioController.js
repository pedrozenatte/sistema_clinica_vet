const { Veterinario } = require('../database/index');

// Criar novo veterinário
exports.createVeterinario = async (req, res) => {
  try {
    const { nome, crmv, email, telefone, especialidade, ativo } = req.body;

    if (!nome || !crmv) {
      return res.status(400).json({ erro: 'Nome e CRMV são obrigatórios' });
    }

    const veterinarioExistente = await Veterinario.findOne({ where: { crmv } });
    if (veterinarioExistente) {
      return res.status(400).json({ erro: 'CRMV já cadastrado' });
    }

    const veterinario = await Veterinario.create({
      nome,
      crmv,
      email,
      telefone,
      especialidade,
      ativo: ativo !== undefined ? ativo : true,
    });

    res.status(201).json({ mensagem: 'Veterinário criado com sucesso', veterinario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar veterinário', detalhes: error.message });
  }
};

// Obter todos os veterinários
exports.getAllVeterinarios = async (req, res) => {
  try {
    const veterinarios = await Veterinario.findAll({
      where: { ativo: true },
      order: [['nome', 'ASC']],
    });

    res.json(veterinarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar veterinários', detalhes: error.message });
  }
};

// Obter veterinário por ID
exports.getVeterinarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const veterinario = await Veterinario.findByPk(id);

    if (!veterinario) {
      return res.status(404).json({ erro: 'Veterinário não encontrado' });
    }

    res.json(veterinario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar veterinário', detalhes: error.message });
  }
};

// Atualizar veterinário
exports.updateVeterinario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, crmv, email, telefone, especialidade, ativo } = req.body;

    const veterinario = await Veterinario.findByPk(id);
    if (!veterinario) {
      return res.status(404).json({ erro: 'Veterinário não encontrado' });
    }

    await veterinario.update({
      nome: nome || veterinario.nome,
      crmv: crmv || veterinario.crmv,
      email: email || veterinario.email,
      telefone: telefone || veterinario.telefone,
      especialidade: especialidade || veterinario.especialidade,
      ativo: ativo !== undefined ? ativo : veterinario.ativo,
    });

    res.json({ mensagem: 'Veterinário atualizado com sucesso', veterinario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar veterinário', detalhes: error.message });
  }
};

// Deletar veterinário (soft delete)
exports.deleteVeterinario = async (req, res) => {
  try {
    const { id } = req.params;
    const veterinario = await Veterinario.findByPk(id);

    if (!veterinario) {
      return res.status(404).json({ erro: 'Veterinário não encontrado' });
    }

    await veterinario.update({ ativo: false });
    res.json({ mensagem: 'Veterinário deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao deletar veterinário', detalhes: error.message });
  }
};
