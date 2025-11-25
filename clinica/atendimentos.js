// Elementos do formulário
const formularioAtendimento = document.querySelector('form');
const inputTutor = document.querySelector('input[name="tutor"]');
const inputPet = document.querySelector('input[name="pet"]');
const inputEspecie = document.querySelector('input[name="especie"]');
const selectVeterinario = document.querySelector('select[name="veterinario"]');
const inputData = document.querySelector('input[name="data"]');
const inputHora = document.querySelector('input[name="hora"]');
const selectTipo = document.querySelector('select[name="tipo"]');
const selectStatus = document.querySelector('select[name="status"]');

// Anamnese
const textareaAnamnese = document.querySelector('textarea[name="anamnese"]');

// Exame Físico
const inputPeso = document.querySelector('input[name="peso"]');
const inputTemperatura = document.querySelector('input[name="temperatura"]');
const inputFC = document.querySelector('input[name="fc"]');
const inputFR = document.querySelector('input[name="fr"]');
const inputHidratacao = document.querySelector('input[name="hidratacao"]');
const inputMucosas = document.querySelector('input[name="mucosas"]');
const textareaExameObs = document.querySelector('textarea[name="exame_obs"]');

// Diagnóstico
const textareaHipoteses = document.querySelector('textarea[name="hipoteses"]');
const textareaExamesSolicitados = document.querySelector('textarea[name="exames_solicitados"]');
const checkboxSolicitarRetorno = document.querySelector('input[name="solicitar_retorno"]');

// Prescrição
const textareaPrescricao = document.querySelector('textarea[name="prescricao"]');
const textareaObservacoes = document.querySelector('textarea[name="observacoes"]');

// Tabela
const tabelaAtendimentos = document.querySelector('table tbody');

let clienteSelecionado = null;
let petSelecionado = null;
let atendimentoSelecionado = null;

// Carregar dados iniciais
async function carregarDados() {
  try {
    // Carregar veterinários
    const resVeterinarios = await fetchAPI('/veterinarios');
    preencherSelectVeterinarios(resVeterinarios);

    // Carregar atendimentos
    await exibirAtendimentos();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    mostrarNotificacao('Erro ao carregar dados', 'erro');
  }
}

// Preencher select de veterinários
function preencherSelectVeterinarios(veterinarios) {
  selectVeterinario.innerHTML = '<option value="">Selecione um veterinário</option>';
  veterinarios.forEach((vet) => {
    const option = document.createElement('option');
    option.value = vet.id;
    option.textContent = vet.nome;
    selectVeterinario.appendChild(option);
  });
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

// Exibir atendimentos
async function exibirAtendimentos() {
  try {
    const atendimentos = await fetchAPI('/atendimentos');

    tabelaAtendimentos.innerHTML = '';

    if (atendimentos.length === 0) {
      tabelaAtendimentos.innerHTML =
        '<tr><td colspan="8">Nenhum atendimento registrado</td></tr>';
      return;
    }

    atendimentos.forEach((atendimento) => {
      const linha = document.createElement('tr');
      const dataFormatada = new Date(atendimento.data_atendimento).toLocaleDateString(
        'pt-BR'
      );
      const horaFormatada = new Date(atendimento.data_atendimento).toLocaleTimeString(
        'pt-BR',
        { hour: '2-digit', minute: '2-digit' }
      );

      linha.innerHTML = `
        <td>${atendimento.cliente?.nome || '-'}</td>
        <td>${atendimento.pet?.nome || '-'}</td>
        <td>${atendimento.veterinario?.nome || '-'}</td>
        <td>${dataFormatada}</td>
        <td>${horaFormatada}</td>
        <td>${atendimento.tipo}</td>
        <td><span class="badge badge-${getBadgeClass(atendimento.status)}">${atendimento.status}</span></td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editarAtendimento(${atendimento.id})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deletarAtendimento(${atendimento.id})">Deletar</button>
        </td>
      `;

      tabelaAtendimentos.appendChild(linha);
    });
  } catch (error) {
    console.error('Erro ao exibir atendimentos:', error);
    mostrarNotificacao('Erro ao carregar atendimentos', 'erro');
  }
}

// Obter classe CSS para badge de status
function getBadgeClass(status) {
  switch (status) {
    case 'Em atendimento':
      return 'warning';
    case 'Finalizado':
      return 'success';
    case 'Cancelado':
      return 'danger';
    default:
      return 'secondary';
  }
}

// Salvar atendimento
async function salvarAtendimento(event) {
  event.preventDefault();

  if (!clienteSelecionado || !petSelecionado) {
    mostrarNotificacao('Selecione um cliente e pet válidos', 'aviso');
    return;
  }

  if (!selectVeterinario.value || !inputData.value || !inputHora.value) {
    mostrarNotificacao('Preencha os campos obrigatórios', 'aviso');
    return;
  }

  const data = inputData.value;
  const hora = inputHora.value;
  const dataHoraCompleta = `${data}T${hora}:00`;

  const dados = {
    cliente_id: clienteSelecionado.id,
    pet_id: petSelecionado.id,
    veterinario_id: parseInt(selectVeterinario.value),
    data_atendimento: dataHoraCompleta,
    tipo: selectTipo.value || 'Consulta',
    status: selectStatus.value || 'Em atendimento',
    anamnese: textareaAnamnese.value,
    peso: inputPeso.value ? parseFloat(inputPeso.value) : null,
    temperatura: inputTemperatura.value ? parseFloat(inputTemperatura.value) : null,
    frequencia_cardiaca: inputFC.value ? parseInt(inputFC.value) : null,
    frequencia_respiratoria: inputFR.value ? parseInt(inputFR.value) : null,
    hidratacao: inputHidratacao.value,
    mucosas: inputMucosas.value,
    exame_obs: textareaExameObs.value,
    hipoteses: textareaHipoteses.value,
    exames_solicitados: textareaExamesSolicitados.value,
    solicitar_retorno: checkboxSolicitarRetorno.checked,
    prescricao: textareaPrescricao.value,
    observacoes: textareaObservacoes.value,
  };

  try {
    if (atendimentoSelecionado) {
      // Atualizar
      await fetchAPI(`/atendimentos/${atendimentoSelecionado}`, 'PUT', dados);
      mostrarNotificacao('Atendimento atualizado com sucesso', 'sucesso');
      atendimentoSelecionado = null;
    } else {
      // Criar
      await fetchAPI('/atendimentos', 'POST', dados);
      mostrarNotificacao('Atendimento registrado com sucesso', 'sucesso');
    }

    limparFormulario();
    await exibirAtendimentos();
  } catch (error) {
    console.error('Erro ao salvar atendimento:', error);
    mostrarNotificacao('Erro ao salvar atendimento', 'erro');
  }
}

// Editar atendimento
async function editarAtendimento(id) {
  try {
    const atendimento = await fetchAPI(`/atendimentos/${id}`);

    atendimentoSelecionado = id;
    clienteSelecionado = atendimento.cliente;
    petSelecionado = atendimento.pet;

    inputTutor.value = atendimento.cliente.nome;
    inputPet.value = atendimento.pet.nome;
    inputEspecie.value = atendimento.pet.especie || '';
    selectVeterinario.value = atendimento.veterinario_id;
    selectTipo.value = atendimento.tipo;
    selectStatus.value = atendimento.status;

    const data = new Date(atendimento.data_atendimento);
    const dataISO = data.toISOString().split('T')[0];
    const hora = data.toTimeString().split(' ')[0].slice(0, 5);
    inputData.value = dataISO;
    inputHora.value = hora;

    textareaAnamnese.value = atendimento.anamnese || '';
    inputPeso.value = atendimento.peso || '';
    inputTemperatura.value = atendimento.temperatura || '';
    inputFC.value = atendimento.frequencia_cardiaca || '';
    inputFR.value = atendimento.frequencia_respiratoria || '';
    inputHidratacao.value = atendimento.hidratacao || '';
    inputMucosas.value = atendimento.mucosas || '';
    textareaExameObs.value = atendimento.exame_obs || '';
    textareaHipoteses.value = atendimento.hipoteses || '';
    textareaExamesSolicitados.value = atendimento.exames_solicitados || '';
    checkboxSolicitarRetorno.checked = atendimento.solicitar_retorno || false;
    textareaPrescricao.value = atendimento.prescricao || '';
    textareaObservacoes.value = atendimento.observacoes || '';

    window.scrollTo(0, 0);
  } catch (error) {
    console.error('Erro ao carregar atendimento:', error);
    mostrarNotificacao('Erro ao carregar atendimento', 'erro');
  }
}

// Deletar atendimento
async function deletarAtendimento(id) {
  if (confirm('Tem certeza que deseja deletar este atendimento?')) {
    try {
      await fetchAPI(`/atendimentos/${id}`, 'DELETE');
      mostrarNotificacao('Atendimento deletado com sucesso', 'sucesso');
      await exibirAtendimentos();
    } catch (error) {
      console.error('Erro ao deletar atendimento:', error);
      mostrarNotificacao('Erro ao deletar atendimento', 'erro');
    }
  }
}

// Limpar formulário
function limparFormulario() {
  formularioAtendimento.reset();
  clienteSelecionado = null;
  petSelecionado = null;
  atendimentoSelecionado = null;
  inputTutor.value = '';
  inputPet.value = '';
  inputEspecie.value = '';
}

// Event listeners
inputTutor.addEventListener('change', buscarClientePorNome);
formularioAtendimento.addEventListener('submit', salvarAtendimento);

// Carregar dados ao iniciar página
document.addEventListener('DOMContentLoaded', carregarDados);
