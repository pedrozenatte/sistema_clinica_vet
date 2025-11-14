// Script para página de cadastro

let clienteAtual = null;
let petsAtual = [];

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const btnNovo = document.querySelector('.actions .btn-ghost');
  const btnSalvar = document.querySelector('.actions .btn-primary');
  const btnExcluir = document.querySelector('.form-actions .btn-danger');
  const btnInativar = document.querySelector('.form-actions .btn-ghost');
  const btnLimpar = document.querySelector('button[type="reset"]');

  // Eventos dos botões
  btnNovo.addEventListener('click', novoCliente);
  btnSalvar.addEventListener('click', salvarCliente);
  btnExcluir.addEventListener('click', excluirCliente);
  btnInativar.addEventListener('click', inativarCliente);

  // Filtros
  document.getElementById('fTipo').addEventListener('change', filtrarCadastros);
  document.getElementById('fSituacao').addEventListener('change', filtrarCadastros);
  document.getElementById('fBusca').addEventListener('input', filtrarCadastros);

  // Máscaras
  adicionarMascaras();

  // Carregar cadastros
  carregarCadastros();
});

/**
 * Adiciona máscaras aos campos
 */
function adicionarMascaras() {
  const cpfCnpjInput = document.querySelector('input[name="cpf_cnpj"]');
  const telefoneInput = document.querySelector('input[name="telefone"]');
  const celularInput = document.querySelector('input[name="celular"]');
  const cepInput = document.querySelector('input[name="cep"]');

  if (cpfCnpjInput) {
    cpfCnpjInput.addEventListener('input', (e) => {
      e.target.value = mascaraCPFCNPJ(e.target.value);
    });
  }

  if (telefoneInput) {
    telefoneInput.addEventListener('input', (e) => {
      e.target.value = mascaraTelefone(e.target.value);
    });
  }

  if (celularInput) {
    celularInput.addEventListener('input', (e) => {
      e.target.value = mascaraTelefone(e.target.value);
    });
  }

  if (cepInput) {
    cepInput.addEventListener('input', (e) => {
      e.target.value = mascaraCEP(e.target.value);
    });
  }
}

/**
 * Carrega lista de cadastros do servidor
 */
async function carregarCadastros() {
  try {
    const clientes = await fetchAPI('/clientes');
    exibirCadastros(clientes);
  } catch (error) {
    mostrarNotificacao('Erro ao carregar cadastros: ' + error.message, 'erro');
  }
}

/**
 * Exibe cadastros na tabela
 */
function exibirCadastros(clientes) {
  const tbody = document.getElementById('cadastrosBody');
  tbody.innerHTML = '';

  if (clientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 20px;">Nenhum cadastro encontrado</td></tr>';
    return;
  }

  clientes.forEach(cliente => {
    const petInfo = cliente.pets && cliente.pets.length > 0
      ? `${cliente.pets[0].nome} (${cliente.pets[0].especie})`
      : '—';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${cliente.codigo || '—'}</td>
      <td>${cliente.nome}</td>
      <td>${cliente.tipo_pessoa}</td>
      <td>${cliente.cpf_cnpj || '—'}</td>
      <td>${petInfo}</td>
      <td>${cliente.telefone || '—'}</td>
      <td>${cliente.email || '—'}</td>
      <td>${cliente.cidade ? cliente.cidade + '/' + cliente.estado : '—'}</td>
      <td>
        <span class="badge badge-${cliente.situacao === 'Liberado' ? 'success' : 'neutral'}">
          ${cliente.situacao}
        </span>
      </td>
      <td>
        <button class="btn-small" onclick="carregarCliente(${cliente.id})">Ver</button>
        <button class="btn-small btn-small-ghost" onclick="carregarCliente(${cliente.id})">Editar</button>
        <button class="btn-small btn-small-ghost" style="color: #dc3545;" onclick="confirmarDeletarCliente(${cliente.id}, '${cliente.nome}')">Deletar</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Carrega um cliente para edição
 */
async function carregarCliente(id) {
  try {
    const cliente = await fetchAPI(`/clientes/${id}`);
    clienteAtual = cliente;
    petsAtual = cliente.pets || [];

    const form = document.querySelector('form');

    // Preencher dados do tutor usando name
    const codigo = form.querySelector('input[name="codigo"]');
    const tipo_pessoa = form.querySelector('select[name="tipo_pessoa"]');
    const situacao = form.querySelector('select[name="situacao"]');
    const nome = form.querySelector('input[name="nome"]');
    const sexo = form.querySelector('select[name="sexo"]');
    const data_nascimento = form.querySelector('input[name="data_nascimento"]');
    const cpf_cnpj = form.querySelector('input[name="cpf_cnpj"]');
    const rua = form.querySelector('input[name="rua"]');
    const numero = form.querySelector('input[name="numero"]');
    const complemento = form.querySelector('input[name="complemento"]');
    const bairro = form.querySelector('input[name="bairro"]');
    const cep = form.querySelector('input[name="cep"]');
    const cidade = form.querySelector('input[name="cidade"]');
    const estado = form.querySelector('select[name="estado"]');
    const telefone = form.querySelector('input[name="telefone"]');
    const celular = form.querySelector('input[name="celular"]');
    const email = form.querySelector('input[name="email"]');

    if (codigo) codigo.value = cliente.codigo;
    if (tipo_pessoa) tipo_pessoa.value = cliente.tipo_pessoa;
    if (situacao) situacao.value = cliente.situacao;
    if (nome) nome.value = cliente.nome;
    if (sexo) sexo.value = cliente.sexo || '';
    if (data_nascimento) data_nascimento.value = cliente.data_nascimento ? cliente.data_nascimento.split('T')[0] : '';
    if (cpf_cnpj) cpf_cnpj.value = cliente.cpf_cnpj || '';
    if (rua) rua.value = cliente.rua || '';
    if (numero) numero.value = cliente.numero || '';
    if (complemento) complemento.value = cliente.complemento || '';
    if (bairro) bairro.value = cliente.bairro || '';
    if (cep) cep.value = cliente.cep || '';
    if (cidade) cidade.value = cliente.cidade || '';
    if (estado) estado.value = cliente.estado || '';
    if (telefone) telefone.value = cliente.telefone || '';
    if (celular) celular.value = cliente.celular || '';
    if (email) email.value = cliente.email || '';

    // Preencher dados do pet
    if (petsAtual.length > 0) {
      const pet = petsAtual[0];
      const pet_nome = form.querySelector('input[name="pet_nome"]');
      const pet_especie = form.querySelector('select[name="pet_especie"]');
      const pet_raca = form.querySelector('input[name="pet_raca"]');
      const pet_sexo = form.querySelector('select[name="pet_sexo"]');
      const pet_data_nascimento = form.querySelector('input[name="pet_data_nascimento"]');
      const pet_peso = form.querySelector('input[name="pet_peso"]');

      if (pet_nome) pet_nome.value = pet.nome;
      if (pet_especie) pet_especie.value = pet.especie;
      if (pet_raca) pet_raca.value = pet.raca || '';
      if (pet_sexo) pet_sexo.value = pet.sexo || '';
      if (pet_data_nascimento) pet_data_nascimento.value = pet.data_nascimento ? pet.data_nascimento.split('T')[0] : '';
      if (pet_peso) pet_peso.value = pet.peso || '';
    }

    // Adicionar ID de cliente como campo hidden
    let idInput = form.querySelector('input[name="id_cliente"]');
    if (!idInput) {
      idInput = document.createElement('input');
      idInput.type = 'hidden';
      idInput.name = 'id_cliente';
      form.appendChild(idInput);
    }
    idInput.value = cliente.id;

    mostrarNotificacao('Cliente carregado para edição', 'info');
  } catch (error) {
    mostrarNotificacao('Erro ao carregar cliente: ' + error.message, 'erro');
  }
}

/**
 * Novo cliente
 */
function novoCliente() {
  clienteAtual = null;
  petsAtual = [];
  const form = document.querySelector('form');
  limparFormulario(form);
  document.querySelector('input[placeholder="00000"]').focus();
}

/**
 * Salva cliente
 */
async function salvarCliente(event) {
  event.preventDefault();

  const form = document.querySelector('form');
  const idInput = form.querySelector('input[name="id_cliente"]');
  const isEdicao = idInput && idInput.value;

  try {
    // Coletar dados do cliente usando name
    const codigo = form.querySelector('input[name="codigo"]').value;
    const tipo_pessoa = form.querySelector('select[name="tipo_pessoa"]').value;
    const nome = form.querySelector('input[name="nome"]').value;
    const sexo = form.querySelector('select[name="sexo"]').value;
    const data_nascimento = form.querySelector('input[name="data_nascimento"]').value;
    const cpf_cnpj = form.querySelector('input[name="cpf_cnpj"]').value;
    const rua = form.querySelector('input[name="rua"]').value;
    const numero = form.querySelector('input[name="numero"]').value;
    const complemento = form.querySelector('input[name="complemento"]').value;
    const bairro = form.querySelector('input[name="bairro"]').value;
    const cep = form.querySelector('input[name="cep"]').value;
    const cidade = form.querySelector('input[name="cidade"]').value;
    const estado = form.querySelector('select[name="estado"]').value;
    const telefone = form.querySelector('input[name="telefone"]').value;
    const celular = form.querySelector('input[name="celular"]').value;
    const email = form.querySelector('input[name="email"]').value;

    if (!codigo || !nome) {
      mostrarNotificacao('Preencha código e nome obrigatoriamente', 'erro');
      return;
    }

    const dadosCliente = {
      codigo,
      tipo_pessoa,
      nome,
      sexo: sexo || null,
      data_nascimento: data_nascimento || null,
      cpf_cnpj: cpf_cnpj || null,
      rua: rua || null,
      numero: numero || null,
      complemento: complemento || null,
      bairro: bairro || null,
      cep: cep || null,
      estado: estado || null,
      telefone: telefone || null,
      celular: celular || null,
      email: email || null,
      situacao: 'Liberado',
    };

    let clienteId;

    // Criar ou atualizar cliente
    if (isEdicao) {
      await fetchAPI(`/clientes/${idInput.value}`, {
        method: 'PUT',
        body: JSON.stringify(dadosCliente),
      });
      clienteId = idInput.value;
      mostrarNotificacao('Cliente atualizado com sucesso', 'sucesso');
    } else {
      const resultado = await fetchAPI('/clientes', {
        method: 'POST',
        body: JSON.stringify(dadosCliente),
      });
      clienteId = resultado.cliente.id;
      mostrarNotificacao('Cliente criado com sucesso', 'sucesso');
    }

    // Coletar dados do pet
    const pet_nome = form.querySelector('input[name="pet_nome"]').value;
    if (pet_nome) {
      const pet_especie = form.querySelector('select[name="pet_especie"]').value;
      const pet_raca = form.querySelector('input[name="pet_raca"]').value;
      const pet_sexo = form.querySelector('select[name="pet_sexo"]').value;
      const pet_data_nascimento = form.querySelector('input[name="pet_data_nascimento"]').value;
      const pet_peso = form.querySelector('input[name="pet_peso"]').value;

      const dadosPet = {
        cliente_id: clienteId,
        nome: pet_nome,
        especie: pet_especie,
        raca: pet_raca || null,
        sexo: pet_sexo || null,
        data_nascimento: pet_data_nascimento || null,
        peso: pet_peso || null,
        microchip: null,
      };

      if (petsAtual.length > 0) {
        // Atualizar pet existente
        await fetchAPI(`/pets/${petsAtual[0].id}`, {
          method: 'PUT',
          body: JSON.stringify(dadosPet),
        });
      } else {
        // Criar novo pet
        await fetchAPI('/pets', {
          method: 'POST',
          body: JSON.stringify(dadosPet),
        });
      }
    }

    // Recarregar cadastros e limpar
    carregarCadastros();
    novoCliente();
  } catch (error) {
    mostrarNotificacao('Erro ao salvar: ' + error.message, 'erro');
  }
}

/**
 * Excluir cliente
 */
async function excluirCliente() {
  if (!clienteAtual) {
    mostrarNotificacao('Selecione um cliente para excluir', 'erro');
    return;
  }

  if (!confirm('Tem certeza que deseja excluir este cliente e seus pets?')) {
    return;
  }

  try {
    await fetchAPI(`/clientes/${clienteAtual.id}`, {
      method: 'DELETE',
    });

    mostrarNotificacao('Cliente excluído com sucesso', 'sucesso');
    carregarCadastros();
    novoCliente();
  } catch (error) {
    mostrarNotificacao('Erro ao excluir: ' + error.message, 'erro');
  }
}

/**
 * Inativar cliente
 */
async function inativarCliente() {
  if (!clienteAtual) {
    mostrarNotificacao('Selecione um cliente para inativar', 'erro');
    return;
  }

  try {
    await fetchAPI(`/clientes/${clienteAtual.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...clienteAtual,
        situacao: 'Inativo',
      }),
    });

    mostrarNotificacao('Cliente inativado com sucesso', 'sucesso');
    carregarCadastros();
    novoCliente();
  } catch (error) {
    mostrarNotificacao('Erro ao inativar: ' + error.message, 'erro');
  }
}

/**
 * Filtrar cadastros
 */
function filtrarCadastros() {
  const tipo = document.getElementById('fTipo').value;
  const situacao = document.getElementById('fSituacao').value;
  const busca = document.getElementById('fBusca').value.toLowerCase();

  const linhas = document.querySelectorAll('#cadastrosBody tr');

  linhas.forEach(linha => {
    let mostrar = true;

    if (tipo && linha.cells[2].textContent !== tipo) {
      mostrar = false;
    }

    if (situacao && !linha.cells[8].textContent.includes(situacao)) {
      mostrar = false;
    }

    if (busca) {
      const textoDaLinha = Array.from(linha.cells).map(c => c.textContent.toLowerCase()).join(' ');
      if (!textoDaLinha.includes(busca)) {
        mostrar = false;
      }
    }

    linha.style.display = mostrar ? '' : 'none';
  });
}

/**
 * Busca cliente por código (busca rápida)
 */
async function buscarClientePorCodigoRapido() {
  const codigo = document.getElementById('inputBuscaRapida').value.trim();
  
  if (!codigo) {
    mostrarNotificacao('Informe um código para buscar', 'erro');
    return;
  }

  try {
    const clientes = await fetchAPI('/clientes');
    const cliente = clientes.find(c => c.codigo === codigo);
    
    if (!cliente) {
      mostrarNotificacao('Cliente não encontrado', 'erro');
      return;
    }

    // Carregar o cliente para edição
    carregarCliente(cliente.id);
    document.getElementById('inputBuscaRapida').value = '';
  } catch (error) {
    mostrarNotificacao('Erro ao buscar cliente: ' + error.message, 'erro');
  }
}

/**
 * Deletar cliente por código direto
 */
async function deletarClientePorCodigo() {
  const codigo = document.getElementById('inputBuscaRapida').value.trim();
  
  if (!codigo) {
    mostrarNotificacao('Informe um código para deletar', 'erro');
    return;
  }

  try {
    const clientes = await fetchAPI('/clientes');
    const cliente = clientes.find(c => c.codigo === codigo);
    
    if (!cliente) {
      mostrarNotificacao('Cliente não encontrado', 'erro');
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome}" e seus pets?`)) {
      return;
    }

    await fetchAPI(`/clientes/${cliente.id}`, {
      method: 'DELETE',
    });

    mostrarNotificacao('Cliente excluído com sucesso', 'sucesso');
    document.getElementById('inputBuscaRapida').value = '';
    carregarCadastros();
    novoCliente();
  } catch (error) {
    mostrarNotificacao('Erro ao excluir cliente: ' + error.message, 'erro');
  }
}

/**
 * Confirmar deleção de cliente (da tabela)
 */
async function confirmarDeletarCliente(clienteId, clienteNome) {
  if (!confirm(`Tem certeza que deseja excluir o cliente "${clienteNome}" e seus pets?`)) {
    return;
  }

  try {
    await fetchAPI(`/clientes/${clienteId}`, {
      method: 'DELETE',
    });

    mostrarNotificacao('Cliente excluído com sucesso', 'sucesso');
    carregarCadastros();
    novoCliente();
  } catch (error) {
    mostrarNotificacao('Erro ao excluir cliente: ' + error.message, 'erro');
  }
}
