const { Cliente, Pet, Veterinario, Atendimento } = require('../database/index');

// Criar novo atendimento
exports.createAtendimento = async (req, res) => {
  try {
    const {
      cliente_id,
      pet_id,
      veterinario_id,
      data_atendimento,
      tipo,
      status,
      anamnese,
      peso,
      temperatura,
      frequencia_cardiaca,
      frequencia_respiratoria,
      hidratacao,
      mucosas,
      exame_obs,
      hipoteses,
      exames_solicitados,
      solicitar_retorno,
      prescricao,
      observacoes,
    } = req.body;

    // Validações
    if (!cliente_id || !pet_id || !veterinario_id || !data_atendimento) {
      return res.status(400).json({
        erro: 'Cliente, pet, veterinário e data de atendimento são obrigatórios',
      });
    }

    // Verificar se cliente, pet e veterinário existem
    const cliente = await Cliente.findByPk(cliente_id);
    const pet = await Pet.findByPk(pet_id);
    const vet = await Veterinario.findByPk(veterinario_id);

    if (!cliente || !pet || !vet) {
      return res.status(404).json({
        erro: 'Cliente, pet ou veterinário não encontrado',
      });
    }

    const atendimento = await Atendimento.create({
      cliente_id,
      pet_id,
      veterinario_id,
      data_atendimento,
      tipo: tipo || 'Consulta',
      status: status || 'Em atendimento',
      anamnese,
      peso,
      temperatura,
      frequencia_cardiaca,
      frequencia_respiratoria,
      hidratacao,
      mucosas,
      exame_obs,
      hipoteses,
      exames_solicitados,
      solicitar_retorno: solicitar_retorno || false,
      prescricao,
      observacoes,
    });

    res.status(201).json({
      mensagem: 'Atendimento criado com sucesso',
      atendimento,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: 'Erro ao criar atendimento',
      detalhes: error.message,
    });
  }
};

// Obter todos os atendimentos
exports.getAllAtendimentos = async (req, res) => {
  try {
    const atendimentos = await Atendimento.findAll({
      include: [
        {
          association: 'cliente',
          attributes: ['id', 'nome', 'codigo'],
        },
        {
          association: 'pet',
          attributes: ['id', 'nome', 'especie'],
        },
        {
          association: 'veterinario',
          attributes: ['id', 'nome'],
        },
      ],
      order: [['data_atendimento', 'DESC']],
    });

    res.status(200).json(atendimentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: 'Erro ao obter atendimentos',
      detalhes: error.message,
    });
  }
};

// Obter atendimento por ID
exports.getAtendimentoById = async (req, res) => {
  try {
    const { id } = req.params;
    const atendimento = await Atendimento.findByPk(id, {
      include: [
        {
          association: 'cliente',
          attributes: ['id', 'nome', 'codigo', 'telefone', 'email'],
        },
        {
          association: 'pet',
          attributes: ['id', 'nome', 'especie', 'raca', 'sexo', 'peso'],
        },
        {
          association: 'veterinario',
          attributes: ['id', 'nome', 'crmv'],
        },
      ],
    });

    if (!atendimento) {
      return res.status(404).json({ erro: 'Atendimento não encontrado' });
    }

    res.status(200).json(atendimento);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: 'Erro ao obter atendimento',
      detalhes: error.message,
    });
  }
};

// Atualizar atendimento
exports.updateAtendimento = async (req, res) => {
  try {
    const { id } = req.params;
    const atendimento = await Atendimento.findByPk(id);

    if (!atendimento) {
      return res.status(404).json({ erro: 'Atendimento não encontrado' });
    }

    await atendimento.update(req.body);

    res.status(200).json({
      mensagem: 'Atendimento atualizado com sucesso',
      atendimento,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: 'Erro ao atualizar atendimento',
      detalhes: error.message,
    });
  }
};

// Deletar atendimento
exports.deleteAtendimento = async (req, res) => {
  try {
    const { id } = req.params;
    const atendimento = await Atendimento.findByPk(id);

    if (!atendimento) {
      return res.status(404).json({ erro: 'Atendimento não encontrado' });
    }

    await atendimento.destroy();

    res.status(200).json({ mensagem: 'Atendimento deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: 'Erro ao deletar atendimento',
      detalhes: error.message,
    });
  }
};

// Obter atendimentos por cliente
exports.getAtendimentosByCliente = async (req, res) => {
  try {
    const { cliente_id } = req.params;

    const atendimentos = await Atendimento.findAll({
      where: { cliente_id },
      include: [
        {
          association: 'pet',
          attributes: ['id', 'nome', 'especie'],
        },
        {
          association: 'veterinario',
          attributes: ['id', 'nome'],
        },
      ],
      order: [['data_atendimento', 'DESC']],
    });

    res.status(200).json(atendimentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: 'Erro ao obter atendimentos do cliente',
      detalhes: error.message,
    });
  }
};

// Obter atendimentos por veterinário
exports.getAtendimentosByVeterinario = async (req, res) => {
  try {
    const { veterinario_id } = req.params;

    const atendimentos = await Atendimento.findAll({
      where: { veterinario_id },
      include: [
        {
          association: 'cliente',
          attributes: ['id', 'nome', 'codigo'],
        },
        {
          association: 'pet',
          attributes: ['id', 'nome', 'especie'],
        },
      ],
      order: [['data_atendimento', 'DESC']],
    });

    res.status(200).json(atendimentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: 'Erro ao obter atendimentos do veterinário',
      detalhes: error.message,
    });
  }
};
