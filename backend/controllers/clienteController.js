const { Cliente, Pet } = require('../database/index');

// Criar novo cliente
exports.createCliente = async (req, res) => {
  try {
    const { codigo, tipo_pessoa, nome, email, telefone, sexo, data_nascimento, cpf_cnpj, rua, numero, complemento, bairro, cidade, estado, cep, situacao } = req.body;

    // Validações básicas
    if (!codigo || !nome || !tipo_pessoa) {
      return res.status(400).json({ erro: 'Código, nome e tipo de pessoa são obrigatórios' });
    }

    const clienteExistente = await Cliente.findOne({ where: { codigo } });
    if (clienteExistente) {
      return res.status(400).json({ erro: 'Código de cliente já existe' });
    }

    const cliente = await Cliente.create({
      codigo,
      tipo_pessoa,
      nome,
      email,
      telefone,
      sexo,
      data_nascimento,
      cpf_cnpj,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
      situacao,
    });

    res.status(201).json({ mensagem: 'Cliente criado com sucesso', cliente });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar cliente', detalhes: error.message });
  }
};

// Obter todos os clientes
exports.getAllClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      include: {
        association: 'pets',
        attributes: ['id', 'nome', 'especie', 'raca'],
      },
      order: [['nome', 'ASC']],
    });

    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar clientes', detalhes: error.message });
  }
};

// Obter cliente por ID
exports.getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id, {
      include: {
        association: 'pets',
        attributes: ['id', 'nome', 'especie', 'raca', 'sexo'],
      },
    });

    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar cliente', detalhes: error.message });
  }
};

// Atualizar cliente
exports.updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, tipo_pessoa, nome, email, telefone, sexo, data_nascimento, cpf_cnpj, rua, numero, complemento, bairro, cidade, estado, cep, situacao } = req.body;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    // Atualizar os campos fornecidos
    await cliente.update({
      codigo: codigo || cliente.codigo,
      tipo_pessoa: tipo_pessoa || cliente.tipo_pessoa,
      nome: nome || cliente.nome,
      email: email || cliente.email,
      telefone: telefone || cliente.telefone,
      sexo: sexo || cliente.sexo,
      data_nascimento: data_nascimento || cliente.data_nascimento,
      cpf_cnpj: cpf_cnpj || cliente.cpf_cnpj,
      rua: rua || cliente.rua,
      numero: numero || cliente.numero,
      complemento: complemento || cliente.complemento,
      bairro: bairro || cliente.bairro,
      cidade: cidade || cliente.cidade,
      estado: estado || cliente.estado,
      cep: cep || cliente.cep,
      situacao: situacao || cliente.situacao,
    });

    res.json({ mensagem: 'Cliente atualizado com sucesso', cliente });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar cliente', detalhes: error.message });
  }
};

// Deletar cliente
exports.deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    await cliente.destroy();
    res.json({ mensagem: 'Cliente deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao deletar cliente', detalhes: error.message });
  }
};

// Buscar cliente por código
exports.searchClienteByCodigo = async (req, res) => {
  try {
    const { codigo } = req.query;

    if (!codigo) {
      return res.status(400).json({ erro: 'Código é obrigatório' });
    }

    const cliente = await Cliente.findOne({
      where: { codigo },
      include: {
        association: 'pets',
        attributes: ['id', 'nome', 'especie', 'raca', 'sexo'],
      },
    });

    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar cliente', detalhes: error.message });
  }
};
