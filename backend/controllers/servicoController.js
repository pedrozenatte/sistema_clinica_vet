const { Servico } = require('../database/index');

// Criar novo serviço
exports.createServico = async (req, res) => {
  try {
    const { nome, descricao, duracao_minutos, valor, ativo } = req.body;

    if (!nome) {
      return res.status(400).json({ erro: 'Nome do serviço é obrigatório' });
    }

    const servicoExistente = await Servico.findOne({ where: { nome } });
    if (servicoExistente) {
      return res.status(400).json({ erro: 'Serviço com este nome já existe' });
    }

    const servico = await Servico.create({
      nome,
      descricao,
      duracao_minutos: duracao_minutos || 30,
      valor,
      ativo: ativo !== undefined ? ativo : true,
    });

    res.status(201).json({ mensagem: 'Serviço criado com sucesso', servico });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar serviço', detalhes: error.message });
  }
};

// Obter todos os serviços
exports.getAllServicos = async (req, res) => {
  try {
    const servicos = await Servico.findAll({
      where: { ativo: true },
      order: [['nome', 'ASC']],
    });

    res.json(servicos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar serviços', detalhes: error.message });
  }
};

// Obter serviço por ID
exports.getServicoById = async (req, res) => {
  try {
    const { id } = req.params;
    const servico = await Servico.findByPk(id);

    if (!servico) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }

    res.json(servico);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar serviço', detalhes: error.message });
  }
};

// Atualizar serviço
exports.updateServico = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, duracao_minutos, valor, ativo } = req.body;

    const servico = await Servico.findByPk(id);
    if (!servico) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }

    await servico.update({
      nome: nome || servico.nome,
      descricao: descricao || servico.descricao,
      duracao_minutos: duracao_minutos || servico.duracao_minutos,
      valor: valor || servico.valor,
      ativo: ativo !== undefined ? ativo : servico.ativo,
    });

    res.json({ mensagem: 'Serviço atualizado com sucesso', servico });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar serviço', detalhes: error.message });
  }
};

// Deletar serviço (soft delete)
exports.deleteServico = async (req, res) => {
  try {
    const { id } = req.params;
    const servico = await Servico.findByPk(id);

    if (!servico) {
      return res.status(404).json({ erro: 'Serviço não encontrado' });
    }

    await servico.update({ ativo: false });
    res.json({ mensagem: 'Serviço deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao deletar serviço', detalhes: error.message });
  }
};
