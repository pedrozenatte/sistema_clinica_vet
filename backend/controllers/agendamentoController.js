const { Agendamento, Cliente, Pet, Veterinario, Servico } = require('../database/index');
const { Op } = require('sequelize');

// Criar novo agendamento
exports.createAgendamento = async (req, res) => {
  try {
    const { cliente_id, pet_id, veterinario_id, servico_id, data_agendamento, hora_inicio, hora_fim, status, observacoes } = req.body;

    if (!cliente_id || !pet_id || !veterinario_id || !servico_id || !data_agendamento || !hora_inicio) {
      return res.status(400).json({ erro: 'Campos obrigatórios: cliente_id, pet_id, veterinario_id, servico_id, data_agendamento, hora_inicio' });
    }

    // Validar se cliente, pet, veterinário e serviço existem
    const cliente = await Cliente.findByPk(cliente_id);
    const pet = await Pet.findByPk(pet_id);
    const veterinario = await Veterinario.findByPk(veterinario_id);
    const servico = await Servico.findByPk(servico_id);

    if (!cliente || !pet || !veterinario || !servico) {
      return res.status(404).json({ erro: 'Cliente, Pet, Veterinário ou Serviço não encontrado' });
    }

    // Validar se pet pertence ao cliente
    if (pet.cliente_id !== cliente_id) {
      return res.status(400).json({ erro: 'Pet não pertence ao cliente especificado' });
    }

    // Validar se o horário não está conflitante
    const agendamentoExistente = await Agendamento.findOne({
      where: {
        veterinario_id,
        data_agendamento,
        hora_inicio,
        status: { [Op.ne]: 'Cancelado' },
      },
    });

    if (agendamentoExistente) {
      return res.status(400).json({ erro: 'Veterinário já tem um agendamento no horário especificado' });
    }

    const agendamento = await Agendamento.create({
      cliente_id,
      pet_id,
      veterinario_id,
      servico_id,
      data_agendamento,
      hora_inicio,
      hora_fim,
      status: status || 'Agendado',
      observacoes,
    });

    res.status(201).json({ mensagem: 'Agendamento criado com sucesso', agendamento });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar agendamento', detalhes: error.message });
  }
};

// Obter todos os agendamentos
exports.getAllAgendamentos = async (req, res) => {
  try {
    const { status, data_inicio, data_fim } = req.query;

    let where = {};

    if (status) {
      where.status = status;
    }

    if (data_inicio && data_fim) {
      where.data_agendamento = {
        [Op.between]: [new Date(data_inicio), new Date(data_fim)],
      };
    }

    const agendamentos = await Agendamento.findAll({
      where,
      include: [
        {
          association: 'cliente',
          attributes: ['id', 'nome', 'email', 'telefone'],
        },
        {
          association: 'pet',
          attributes: ['id', 'nome', 'especie', 'raca'],
        },
        {
          association: 'veterinario',
          attributes: ['id', 'nome', 'crmv'],
        },
        {
          association: 'servico',
          attributes: ['id', 'nome', 'valor'],
        },
      ],
      order: [['data_agendamento', 'ASC'], ['hora_inicio', 'ASC']],
    });

    res.json(agendamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar agendamentos', detalhes: error.message });
  }
};

// Obter agendamento por ID
exports.getAgendamentoById = async (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = await Agendamento.findByPk(id, {
      include: [
        {
          association: 'cliente',
          attributes: ['id', 'nome', 'email', 'telefone'],
        },
        {
          association: 'pet',
          attributes: ['id', 'nome', 'especie', 'raca'],
        },
        {
          association: 'veterinario',
          attributes: ['id', 'nome', 'crmv'],
        },
        {
          association: 'servico',
          attributes: ['id', 'nome', 'valor'],
        },
      ],
    });

    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    res.json(agendamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar agendamento', detalhes: error.message });
  }
};

// Atualizar agendamento
exports.updateAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { cliente_id, pet_id, veterinario_id, servico_id, data_agendamento, hora_inicio, hora_fim, status, observacoes } = req.body;

    const agendamento = await Agendamento.findByPk(id);
    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    await agendamento.update({
      cliente_id: cliente_id || agendamento.cliente_id,
      pet_id: pet_id || agendamento.pet_id,
      veterinario_id: veterinario_id || agendamento.veterinario_id,
      servico_id: servico_id || agendamento.servico_id,
      data_agendamento: data_agendamento || agendamento.data_agendamento,
      hora_inicio: hora_inicio || agendamento.hora_inicio,
      hora_fim: hora_fim || agendamento.hora_fim,
      status: status || agendamento.status,
      observacoes: observacoes || agendamento.observacoes,
    });

    res.json({ mensagem: 'Agendamento atualizado com sucesso', agendamento });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar agendamento', detalhes: error.message });
  }
};

// Deletar agendamento
exports.deleteAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = await Agendamento.findByPk(id);

    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado' });
    }

    await agendamento.destroy();
    res.json({ mensagem: 'Agendamento deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao deletar agendamento', detalhes: error.message });
  }
};

// Obter agendamentos de um cliente
exports.getAgendamentosByCliente = async (req, res) => {
  try {
    const { cliente_id } = req.params;

    const agendamentos = await Agendamento.findAll({
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
        {
          association: 'servico',
          attributes: ['id', 'nome', 'valor'],
        },
      ],
      order: [['data_agendamento', 'ASC']],
    });

    res.json(agendamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar agendamentos do cliente', detalhes: error.message });
  }
};

// Obter agendamentos de um veterinário
exports.getAgendamentosByVeterinario = async (req, res) => {
  try {
    const { veterinario_id } = req.params;
    const { data } = req.query;

    let where = { veterinario_id };

    if (data) {
      where.data_agendamento = {
        [Op.gte]: new Date(data),
        [Op.lt]: new Date(new Date(data).setDate(new Date(data).getDate() + 1)),
      };
    }

    const agendamentos = await Agendamento.findAll({
      where,
      include: [
        {
          association: 'cliente',
          attributes: ['id', 'nome', 'telefone'],
        },
        {
          association: 'pet',
          attributes: ['id', 'nome', 'especie'],
        },
        {
          association: 'servico',
          attributes: ['id', 'nome'],
        },
      ],
      order: [['data_agendamento', 'ASC'], ['hora_inicio', 'ASC']],
    });

    res.json(agendamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar agendamentos do veterinário', detalhes: error.message });
  }
};
