// Elementos do formulário
const formularioAgendamento = document.querySelector('form');
const inputTutor = document.querySelector('input[name="tutor"]');
const inputPet = document.querySelector('input[name="pet"]');
const inputEspecie = document.querySelector('input[name="especie"]');
const inputServico = document.querySelector('input[name="servico"]');
const inputVeterinario = document.querySelector('input[name="veterinario"]');
const inputData = document.querySelector('input[name="data"]');
const inputHora = document.querySelector('input[name="hora"]');
const selectDuracao = document.querySelector('select[name="duracao"]');
const selectTipo = document.querySelector('select[name="tipo"]');
const selectPrioridade = document.querySelector('select[name="prioridade"]');
const selectStatus = document.querySelector('select[name="status"]');
const selectCanal = document.querySelector('select[name="canal"]');
const textareaObservacoes = document.querySelector('textarea[name="observacoes"]');

// Tabelas
const tabelaProximos = document.querySelector('table:nth-of-type(1) tbody');
const tabelaAgenda = document.querySelector('table:nth-of-type(2) tbody');

let clienteSelecionado = null;
let petSelecionado = null;
let agendamentoSelecionado = null;

// Carregar dados iniciais
async function carregarDados() {
  try {
    // Carregar agendamentos
    await exibirAgendamentos();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    mostrarNotificacao('Erro ao carregar dados', 'erro');
  }
}

// Buscar cliente por nome (autocomplete)
async function buscarClientePorNome(event) {
  const busca = event.target.value.trim().toLowerCase();

  if (!busca) {
    clienteSelecionado = null;
    limparPets();
    return;
  }

  try {
    const clientes = await fetchAPI('/clientes');
    const clienteFiltrado = clientes.find((c) =>
      c.nome.toLowerCase().includes(busca) || c.codigo === parseInt(busca)
    );

    if (clienteFiltrado) {
      clienteSelecionado = clienteFiltrado;
      inputTutor.value = clienteFiltrado.nome;
      carregarPetsDoCliente(clienteFiltrado.id);
    } else {
      mostrarNotificacao('Cliente não encontrado', 'aviso');
      clienteSelecionado = null;
      limparPets();
    }
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    mostrarNotificacao('Erro ao buscar cliente', 'erro');
  }
}

// Carregar pets do cliente selecionado
async function carregarPetsDoCliente(clienteId) {
  try {
    const pets = await fetchAPI(`/pets?cliente_id=${clienteId}`);
    if (pets.length > 0) {
      const pet = pets[0];
      petSelecionado = pet;
      inputPet.value = pet.nome;
      inputEspecie.value = pet.especie || '';
    } else {
      mostrarNotificacao('Este cliente não possui pets cadastrados', 'aviso');
      limparPets();
    }
  } catch (error) {
    console.error('Erro ao carregar pets:', error);
    mostrarNotificacao('Erro ao carregar pets', 'erro');
  }
}

// Limpar dados de pets
function limparPets() {
  petSelecionado = null;
  inputPet.value = '';
  inputEspecie.value = '';
}

// Exibir agendamentos
async function exibirAgendamentos() {
  try {
    const agendamentos = await fetchAPI('/agendamentos');

    // Limpar tabelas
    tabelaProximos.innerHTML = '';
    tabelaAgenda.innerHTML = '';

    if (agendamentos.length === 0) {
      tabelaProximos.innerHTML =
        '<tr><td colspan="7">Nenhum agendamento registrado</td></tr>';
      tabelaAgenda.innerHTML =
        '<tr><td colspan="8">Nenhum agendamento registrado</td></tr>';
      return;
    }

    const agora = new Date();
    const proximosAgendamentos = [];
    const todoAgendamentos = [];

    agendamentos.forEach((agendamento) => {
      const dataAgendamento = new Date(agendamento.data_agendamento);

      if (dataAgendamento > agora) {
        proximosAgendamentos.push(agendamento);
      }

      todoAgendamentos.push(agendamento);
    });

    // Próximos agendamentos (ordenados por data)
    proximosAgendamentos.sort(
      (a, b) => new Date(a.data_agendamento) - new Date(b.data_agendamento)
    );
    proximosAgendamentos.slice(0, 10).forEach((agendamento) => {
      const linha = criarLinhaProximo(agendamento);
      tabelaProximos.appendChild(linha);
    });

    if (proximosAgendamentos.length === 0) {
      tabelaProximos.innerHTML =
        '<tr><td colspan="7">Nenhum agendamento próximo</td></tr>';
    }

    // Todos agendamentos (ordenados por data - mais recentes primeiro)
    todoAgendamentos.sort(
      (a, b) => new Date(b.data_agendamento) - new Date(a.data_agendamento)
    );
    todoAgendamentos.forEach((agendamento) => {
      const linha = criarLinhaAgenda(agendamento);
      tabelaAgenda.appendChild(linha);
    });
  } catch (error) {
    console.error('Erro ao exibir agendamentos:', error);
    mostrarNotificacao('Erro ao carregar agendamentos', 'erro');
  }
}

// Criar linha da tabela "Próximos"
function criarLinhaProximo(agendamento) {
  const linha = document.createElement('tr');
  const data = new Date(agendamento.data_agendamento);
  const dataFormatada = data.toLocaleDateString('pt-BR');
  const horaFormatada = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  linha.innerHTML = `
    <td>${agendamento.cliente?.nome || '-'}</td>
    <td>${agendamento.pet?.nome || '-'}</td>
    <td>${agendamento.veterinario?.nome || '-'}</td>
    <td>${dataFormatada}</td>
    <td>${horaFormatada}</td>
    <td>${agendamento.prioridade || '-'}</td>
    <td>
      <button class="btn btn-sm btn-primary" onclick="editarAgendamento(${agendamento.id})">Editar</button>
      <button class="btn btn-sm btn-danger" onclick="deletarAgendamento(${agendamento.id})">Cancelar</button>
    </td>
  `;

  return linha;
}

// Criar linha da tabela "Agenda Geral"
function criarLinhaAgenda(agendamento) {
  const linha = document.createElement('tr');
  const data = new Date(agendamento.data_agendamento);
  const dataFormatada = data.toLocaleDateString('pt-BR');
  const horaFormatada = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  linha.innerHTML = `
    <td>${agendamento.cliente?.nome || '-'}</td>
    <td>${agendamento.pet?.nome || '-'}</td>
    <td>${agendamento.veterinario?.nome || '-'}</td>
    <td>${agendamento.servico?.nome || '-'}</td>
    <td>${dataFormatada}</td>
    <td>${horaFormatada}</td>
    <td><span class="badge badge-${getBadgeClass(agendamento.status)}">${agendamento.status}</span></td>
    <td>
      <button class="btn btn-sm btn-primary" onclick="editarAgendamento(${agendamento.id})">Editar</button>
      <button class="btn btn-sm btn-danger" onclick="deletarAgendamento(${agendamento.id})">Cancelar</button>
    </td>
  `;

  return linha;
}

// Obter classe CSS para badge de status
function getBadgeClass(status) {
  switch (status) {
    case 'Confirmado':
      return 'success';
    case 'Pendente':
      return 'warning';
    case 'Cancelado':
      return 'danger';
    case 'Confirmação':
      return 'info';
    default:
      return 'secondary';
  }
}

// Salvar agendamento
async function salvarAgendamento(event) {
  event.preventDefault();

  if (!clienteSelecionado || !petSelecionado) {
    mostrarNotificacao('Selecione um cliente e pet válidos', 'aviso');
    return;
  }

  if (
    !inputServico.value ||
    !inputVeterinario.value ||
    !inputData.value ||
    !inputHora.value
  ) {
    mostrarNotificacao('Preencha os campos obrigatórios', 'aviso');
    return;
  }

  const data = inputData.value;
  const hora = inputHora.value;
  const dataHoraCompleta = `${data}T${hora}:00`;

  const dados = {
    cliente_id: clienteSelecionado.id,
    pet_id: petSelecionado.id,
    servico: inputServico.value,
    veterinario: inputVeterinario.value,
    data_agendamento: dataHoraCompleta,
    duracao: selectDuracao.value ? parseInt(selectDuracao.value.split(' ')[0]) : 30,
    tipo: selectTipo.value || 'Rotina',
    prioridade: selectPrioridade.value || 'Normal',
    status: selectStatus.value || 'Pendente',
    canal: selectCanal.value || 'Presencial',
    observacoes: textareaObservacoes.value,
  };

  try {
    if (agendamentoSelecionado) {
      // Atualizar
      await fetchAPI(`/agendamentos/${agendamentoSelecionado}`, 'PUT', dados);
      mostrarNotificacao('Agendamento atualizado com sucesso', 'sucesso');
      agendamentoSelecionado = null;
    } else {
      // Criar
      await fetchAPI('/agendamentos', 'POST', dados);
      mostrarNotificacao('Agendamento registrado com sucesso', 'sucesso');
    }

    limparFormulario();
    await exibirAgendamentos();
  } catch (error) {
    console.error('Erro ao salvar agendamento:', error);
    mostrarNotificacao('Erro ao salvar agendamento', 'erro');
  }
}

// Editar agendamento
async function editarAgendamento(id) {
  try {
    const agendamento = await fetchAPI(`/agendamentos/${id}`);

    agendamentoSelecionado = id;
    clienteSelecionado = agendamento.cliente;
    petSelecionado = agendamento.pet;

    inputTutor.value = agendamento.cliente.nome;
    inputPet.value = agendamento.pet.nome;
    inputEspecie.value = agendamento.pet.especie || '';
    inputServico.value = agendamento.servico_nome || '';
    inputVeterinario.value = agendamento.veterinario_nome || '';
    selectTipo.value = agendamento.tipo;
    selectPrioridade.value = agendamento.prioridade;
    selectStatus.value = agendamento.status;

    const data = new Date(agendamento.data_agendamento);
    const dataISO = data.toISOString().split('T')[0];
    const hora = data.toTimeString().split(' ')[0].slice(0, 5);
    inputData.value = dataISO;
    inputHora.value = hora;

    selectDuracao.value = (agendamento.duracao || 30) + ' min';
    selectCanal.value = agendamento.canal || '';
    textareaObservacoes.value = agendamento.observacoes || '';

    window.scrollTo(0, 0);
  } catch (error) {
    console.error('Erro ao carregar agendamento:', error);
    mostrarNotificacao('Erro ao carregar agendamento', 'erro');
  }
}

// Deletar/Cancelar agendamento
async function deletarAgendamento(id) {
  if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
    try {
      await fetchAPI(`/agendamentos/${id}`, 'DELETE');
      mostrarNotificacao('Agendamento cancelado com sucesso', 'sucesso');
      await exibirAgendamentos();
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      mostrarNotificacao('Erro ao cancelar agendamento', 'erro');
    }
  }
}

// Limpar formulário
function limparFormulario() {
  formularioAgendamento.reset();
  clienteSelecionado = null;
  petSelecionado = null;
  agendamentoSelecionado = null;
  inputTutor.value = '';
  inputPet.value = '';
  inputEspecie.value = '';
  inputServico.value = '';
  inputVeterinario.value = '';
}

// Event listeners
inputTutor.addEventListener('change', buscarClientePorNome);
formularioAgendamento.addEventListener('submit', salvarAgendamento);

// Carregar dados ao iniciar página
document.addEventListener('DOMContentLoaded', carregarDados);
