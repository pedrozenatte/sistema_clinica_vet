(() => {
  const tableProximos = document.getElementById('proximosBody');
  const tableAgenda = document.getElementById('agendaBody');
  const filtroEspecie = document.getElementById('agendaEspecie');
  const filtroPeriodo = document.getElementById('agendaPeriodo');
  const filtroBusca = document.getElementById('agendaBusca');
  const agendaCountLabel = document.getElementById('agendaCount');
  
  const formAgendamento = document.querySelector('#formAgendamentoWrapper'); 
  const formTitle = formAgendamento?.querySelector('.card-title'); // To change title during edit
  
  // Auto-complete elements
  const inputTutor = formAgendamento?.querySelector('[name="tutor"]');
  const listTutores = document.getElementById('listTutores');
  const inputPet = formAgendamento?.querySelector('[name="pet"]');
  const listPets = document.getElementById('listPets');
  const inputEspecie = formAgendamento?.querySelector('[name="especie"]');
  
  const btnNovoAgendamento = document.getElementById('btnNovoAgendamento');
  const btnCancelarForm = document.getElementById('btnCancelarAgendamento');
  const btnExcluirAgendamento = document.getElementById('btnExcluirAgendamento');
  
  // Modal elements
  const modalDetalhes = document.getElementById('modalDetalhes');
  const btnFecharDetalhes = document.getElementById('btnFecharDetalhes');
  const detalhesBody = document.getElementById('detalhesBody');
  
  let agendamentos = [];
  let clientesData = [];
  let filteredItems = [];
  let currentPage = 1;
  const itemsPerPage = 10;
  let editingId = null;
  let selectedClienteId = null;
  let selectedPetId = null;

  const paginationControls = document.getElementById('paginationControls');

  const badgeClass = (status) => {
    const map = {
      Agendado: 'badge-info',
      Cancelado: 'badge-danger',
      Compareceu: 'badge-success',
      Faltou: 'badge-warning',
    };
    return map[status] || 'badge-neutral';
  };

  const normalizeDateValue = (value = '') => {
    if (!value) return '';
    if (typeof value === 'string') {
      const match = value.match(/^\d{4}-\d{2}-\d{2}/);
      if (match) return match[0];
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed)) return parsed.toISOString().slice(0, 10);
    return '';
  };

  const normalizeTimeValue = (value = '') => {
    if (!value) return '';
    if (typeof value === 'string') {
      const match = value.match(/(\d{2}):(\d{2})/);
      if (match) return `${match[1]}:${match[2]}`;
    }
    if (value instanceof Date) {
      return value.toISOString().slice(11, 16);
    }
    return '';
  };

  const getDateTime = (item) => {
    const data = normalizeDateValue(item.data);
    const hora = normalizeTimeValue(item.hora) || '00:00';
    return data ? new Date(`${data}T${hora}`) : new Date(NaN);
  };

  const displayDate = (val) => {
    const normalized = normalizeDateValue(val);
    return normalized ? Utils.formatDate(normalized) : '--';
  };

  const displayTime = (val) => {
    const normalized = normalizeTimeValue(val);
    return normalized || '--';
  };

  const resetSelections = () => {
    selectedClienteId = null;
    selectedPetId = null;
  };

  const parseTutorValue = (value = '') => {
    const trimmed = value.trim();
    if (!trimmed) return { codigo: '', nome: '' };
    const match = trimmed.match(/^(\S+)\s+—\s+(.*)$/);
    if (match) {
      return { codigo: match[1], nome: match[2].trim() };
    }
    return { codigo: '', nome: trimmed };
  };

  const findCliente = (value = '') => {
    const { codigo, nome } = parseTutorValue(value);
    if (codigo) {
      const byCode = clientesData.find((c) => (c.codigo || '').toLowerCase() === codigo.toLowerCase());
      if (byCode) return byCode;
    }
    if (nome) {
      return clientesData.find((c) => (c.nome || '').toLowerCase() === nome.toLowerCase());
    }
    return null;
  };

  const formatTutorOption = (cliente) => `${cliente.codigo || ''} — ${cliente.nome}`;

  const formatTutorInput = (cliente, nomeFallback = '') => {
    if (cliente) return formatTutorOption(cliente);
    return nomeFallback;
  };

  const getPetFromCliente = (cliente, petNome = '') => {
    if (!cliente || !Array.isArray(cliente.pets)) return null;
    return cliente.pets.find((p) => (p.nome || '').toLowerCase() === petNome.toLowerCase());
  };

  const renderProximos = () => {
    if (!tableProximos) return;
    const agora = new Date();
    const proximos = agendamentos
      .filter((item) => {
        if (item.destaque) return true;
        const dataHora = getDateTime(item);
        if (Number.isNaN(dataHora)) return false;
        return dataHora >= agora && item.status !== 'Cancelado' && item.status !== 'Faltou';
      })
      .sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`))
      .slice(0, 3);

    const rows = proximos.map((item) => `
      <tr>
        <td>${displayDate(item.data)}</td>
        <td>${displayTime(item.hora)}</td>
        <td>${item.pet_nome}</td>
        <td>${item.tutor_nome}</td>
        <td>${item.servico}</td>
        <td>${item.veterinario || '—'}</td>
        <td><span class="badge ${badgeClass(item.status)}">${item.status}</span></td>
      </tr>
    `);

    Utils.renderRows(tableProximos, rows, 7, 'Nenhum agendamento próximo.');
  };

  const canAttend = (status = '') => {
    const normalized = (status || '').toLowerCase();
    return !['cancelado', 'faltou', 'compareceu', 'em atendimento', 'atendido', 'finalizado'].includes(normalized);
  };

  const renderAgenda = (data) => {
    if (!tableAgenda) return;
    const rows = data
      .map((item) => {
        const podeAtender = canAttend(item.status);
        return `
        <tr data-id="${item.id}">
          <td>${displayDate(item.data)}</td>
          <td>${displayTime(item.hora)}</td>
          <td>${item.pet_nome} (${item.especie || '—'})</td>
          <td>${item.tutor_nome}</td>
          <td>${item.servico}</td>
          <td>${item.veterinario || '—'}</td>
          <td><span class="badge ${badgeClass(item.status)}">${item.status}</span></td>
          <td>${Utils.formatPhone(item.contato || '')}</td>
          <td>
            <div class="table-actions">
              <button type="button" class="btn-small btn-small-ghost" data-id="${item.id}" data-action="ver">Ver</button>
              <button type="button" class="btn-small" data-id="${item.id}" data-action="editar">Editar</button>
              <button type="button" class="btn-small" data-id="${item.id}" data-action="atender" ${podeAtender ? '' : 'disabled'}>
                Atender
              </button>
            </div>
          </td>
        </tr>
      `;
      });

    Utils.renderRows(tableAgenda, rows, 9, 'Nenhum agendamento encontrado.');
  };

  const renderPaginationControls = () => {
    if (!paginationControls) return;
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
    
    paginationControls.innerHTML = `
      <button class="btn btn-ghost btn-small" id="btnPrevPage" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
      <span>Página ${currentPage} de ${totalPages}</span>
      <button class="btn btn-ghost btn-small" id="btnNextPage" ${currentPage >= totalPages ? 'disabled' : ''}>Próxima página</button>
    `;

    document.getElementById('btnPrevPage')?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderPagination();
      }
    });

    document.getElementById('btnNextPage')?.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderPagination();
      }
    });
  };

  const renderPagination = () => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filteredItems.slice(start, end);
    
    renderAgenda(pageItems);
    renderPaginationControls();
  };

  const aplicarFiltros = () => {
    const especieFiltro = (filtroEspecie?.value || '').toLowerCase();
    const periodoDias = parseInt(filtroPeriodo?.value || '', 10);
    const busca = (filtroBusca?.value || '').trim().toLowerCase();
    const hoje = new Date();
    const inicio =
      !Number.isNaN(periodoDias) && periodoDias > 0
        ? new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - periodoDias)
        : null;

    filteredItems = agendamentos.filter((item) => {
      const dataAtual = getDateTime(item);
      if (Number.isNaN(dataAtual)) return false;
      if (inicio && dataAtual < inicio) return false;
      if (especieFiltro && (item.especie || '').toLowerCase() !== especieFiltro) return false;
      if (busca) {
        const tutor = (item.tutor_nome || '').toLowerCase();
        if (!tutor.includes(busca)) return false;
      }
      return true;
    });

    // Sort filtered items
    filteredItems.sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`));

    currentPage = 1;
    renderPagination();

    if (agendaCountLabel) {
      agendaCountLabel.textContent =
        filteredItems.length === 1 ? '1 registro' : `${filteredItems.length} registros`;
    }
  };

  const carregarAgendamentos = async () => {
    try {
      const params = new URLSearchParams();
      const resp = await fetch(`/api/agendamentos?${params.toString()}`);
      if (!resp.ok) throw new Error('Falha ao obter agendamentos.');
      const data = await resp.json();
      agendamentos = data; 
      renderProximos();
      aplicarFiltros();
    } catch (error) {
      console.error(error);
      Utils.showCustomAlert('Não foi possível carregar os agendamentos.');
    }
  };

  const carregarClientes = async () => {
    try {
      const resp = await fetch('/api/clientes');
      if (!resp.ok) throw new Error('Falha ao carregar clientes.');
      clientesData = await resp.json();
      if (listTutores) {
        listTutores.innerHTML = clientesData
          .map((c) => `<option value="${formatTutorOption(c)}"></option>`)
          .join('');
      }
    } catch (error) {
      console.error('Erro carregando clientes:', error);
    }
  };

  // --- Modal Logic (Ver) ---
  const toggleModalDetalhes = (open) => {
    if (!modalDetalhes) return;
    if (open) {
      modalDetalhes.removeAttribute('hidden');
      modalDetalhes.style.display = 'flex';
    } else {
      modalDetalhes.setAttribute('hidden', 'hidden');
      modalDetalhes.style.display = 'none';
    }
  };

  const showDetalhes = (id) => {
    const item = agendamentos.find((a) => a.id == id); // tolera string/number
    if (!item) {
      Utils.showCustomAlert('Agendamento não encontrado.');
      return;
    }

    const detalhes = [
      { label: 'Data', value: displayDate(item.data) },
      { label: 'Hora', value: displayTime(item.hora) },
      { label: 'Tutor', value: item.tutor_nome || '—' },
      { label: 'Contato', value: Utils.formatPhone(item.contato || '') || '—' },
      { label: 'Pet', value: item.pet_nome || '—' },
      { label: 'Espécie', value: item.especie || '—' },
      { label: 'Serviço', value: item.servico || '—' },
      { label: 'Veterinário', value: item.veterinario || '—' },
      { label: 'Tipo', value: item.tipo || '—' },
      { label: 'Prioridade', value: item.prioridade || '—' },
      { label: 'Canal', value: item.canal || '—' },
      { label: 'Duração', value: item.duracao || '—' },
    ];

    if (detalhesBody) {
      const statusBadge = `<span class="badge ${badgeClass(item.status)}">${item.status || '—'}</span>`;
      detalhesBody.innerHTML = `
        <section class="detail-section">
          <header class="detail-section__header">
            <h3>Dados do agendamento</h3>
            ${statusBadge}
          </header>
          <div class="detail-grid">
            ${detalhes
              .map(
                (d) =>
                  `<div><span class="detail-label">${d.label}</span><strong class="detail-value">${d.value}</strong></div>`,
              )
              .join('')}
          </div>
        </section>
        <section class="detail-section">
          <header class="detail-section__header">
            <h3>Observações</h3>
          </header>
          <p class="detail-value">${item.observacoes || '—'}</p>
        </section>
      `;
    }
    const titulo = document.getElementById('detalhesTitulo');
    if (titulo) titulo.textContent = 'Agendamento';
    toggleModalDetalhes(true);
  };

  // --- Edit Logic ---
  const startEditing = (id) => {
    const item = agendamentos.find((a) => a.id == id);
    if (!item) return;

    if (formAgendamento.classList.contains('form-hidden')) {
      formAgendamento.classList.remove('form-hidden');
      btnNovoAgendamento.textContent = 'Cancelar Edição';
    }
    if (btnExcluirAgendamento) btnExcluirAgendamento.hidden = false;

    editingId = `${id}`;
    if (formTitle) formTitle.textContent = 'Editar Agendamento';

    const f = formAgendamento;
    const tutorInput = f.querySelector('[name="tutor"]');
    const petInput = f.querySelector('[name="pet"]');
    const especieSelect = f.querySelector('[name="especie"]');

    const cliente =
      clientesData.find((c) => c.id === item.cliente_id) || findCliente(item.tutor_nome || '');
    selectedClienteId = item.cliente_id || cliente?.id || null;
    if (listPets) {
      if (cliente && Array.isArray(cliente.pets)) {
        listPets.innerHTML = cliente.pets
          .map((p) => `<option value="${p.nome}">${p.especie || ''}</option>`)
          .join('');
      } else {
        listPets.innerHTML = '';
      }
    }
    selectedPetId = item.pet_id || getPetFromCliente(cliente, item.pet_nome || '')?.id || null;

    if (tutorInput) tutorInput.value = formatTutorInput(cliente, item.tutor_nome || '');
    if (petInput) petInput.value = item.pet_nome || '';
    if (especieSelect) especieSelect.value = item.especie || 'Canina';
    f.querySelector('[name="servico"]').value = item.servico || 'Consulta';
    f.querySelector('[name="veterinario"]').value = item.veterinario || '';
    f.querySelector('[name="data"]').value = normalizeDateValue(item.data) || '';
    f.querySelector('[name="hora"]').value = normalizeTimeValue(item.hora) || '';
    f.querySelector('[name="duracao"]').value = item.duracao || '30 min';
    f.querySelector('[name="tipo"]').value = item.tipo || 'Presencial';
    f.querySelector('[name="prioridade"]').value = item.prioridade || 'Normal';
    f.querySelector('[name="status"]').value = item.status || 'Agendado';
    f.querySelector('[name="canal"]').value = item.canal || 'Telefone';
    f.querySelector('[name="obs"]').value = item.observacoes || '';

    formAgendamento.scrollIntoView({ behavior: 'smooth' });
  };

  const limparFormulario = () => {
    if (!formAgendamento) return;
    formAgendamento.reset();
    resetSelections();
    editingId = null;
    if (formTitle) formTitle.textContent = 'Novo Agendamento';
    if (btnExcluirAgendamento) btnExcluirAgendamento.hidden = true;
    if (btnNovoAgendamento) {
      const isHidden = formAgendamento.classList.contains('form-hidden');
      btnNovoAgendamento.textContent = isHidden ? 'Novo Agendamento' : 'Esconder Formulário';
    }
    if (listPets) listPets.innerHTML = '';
  };

  const upsertLocalAgendamento = (item) => {
    if (!item || !item.id) return;
    const idx = agendamentos.findIndex((a) => a.id === item.id);
    if (idx >= 0) {
      agendamentos[idx] = item;
    } else {
      agendamentos.unshift(item);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!formAgendamento) return;
    const dados = new FormData(formAgendamento);

    // Validação de tutor cadastrado
    const tutorNome = (dados.get('tutor') || '').trim();
    const cliente = findCliente(tutorNome);
    if (!cliente) {
      Utils.showCustomAlert('Selecione um tutor já cadastrado.');
      return;
    }
    selectedClienteId = cliente.id;

    // Helper to get contact
    const getContact = () => {
        return cliente ? (cliente.telefone || cliente.email) : '';
    };

    const dataValor = normalizeDateValue(dados.get('data'));
    const horaValor = normalizeTimeValue(dados.get('hora'));

    const payload = {
      cliente_id: selectedClienteId,
      pet_id: selectedPetId,
      tutor_nome: cliente.nome || '',
      pet_nome: dados.get('pet') || '',
      especie: dados.get('especie') || '',
      servico: dados.get('servico') || '',
      veterinario: dados.get('veterinario') || '',
      data: dataValor,
      hora: horaValor,
      duracao: dados.get('duracao') || '',
      tipo: dados.get('tipo') || '',
      prioridade: dados.get('prioridade') || '',
      status: dados.get('status') || 'Agendado',
      canal: dados.get('canal') || 'Telefone',
      observacoes: dados.get('obs') || '',
      contato: getContact(),
      destaque: true,
    };

    if (!payload.pet_nome || !payload.tutor_nome || !payload.data || !payload.hora) {
      Utils.showCustomAlert('Informe tutor, pet, data e hora.');
      return;
    }

    try {
      let resp;
      if (editingId) {
        // PUT update
        resp = await fetch(`/api/agendamentos/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
      } else {
        // POST create
        resp = await fetch('/api/agendamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
      }

      if (!resp.ok) {
        const info = await resp.json();
        throw new Error(info?.error || 'Erro ao salvar agendamento.');
      }

      const saved = await resp.json();
      upsertLocalAgendamento(saved);
      renderProximos();
      aplicarFiltros();
      
      // Hide and reset
      formAgendamento.classList.add('form-hidden');
      limparFormulario(); 
      
      Utils.showCustomAlert('Agendamento salvo!');
    } catch (error) {
      console.error(error);
      Utils.showCustomAlert(error.message);
    }
  };

  // --- Event Listeners ---

  // 1. Table Actions (Ver / Editar)
  const criarAtendimento = async (agendamento) => {
    const payload = {
      agendamento_id: agendamento.id,
      cliente_id: agendamento.cliente_id,
      pet_id: agendamento.pet_id,
      tutor_nome: agendamento.tutor_nome,
      pet_nome: agendamento.pet_nome,
      especie: agendamento.especie,
      veterinario: agendamento.veterinario,
      tipo: agendamento.tipo || 'Consulta',
      status: 'Em atendimento',
      data: normalizeDateValue(agendamento.data),
      hora: normalizeTimeValue(agendamento.hora),
      anamnese: '',
      exame_obs: '',
      hipoteses: '',
      exames: '',
      prescricao: [],
    };

    try {
      const resp = await fetch('/api/atendimentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const info = await resp.json();
        throw new Error(info?.error || 'Erro ao criar atendimento.');
      }
      const atendimento = await resp.json();
      await fetch(`/api/agendamentos/${agendamento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Compareceu' }),
      });
      window.location.href = `/pages/atendimentos.html?focus=${atendimento.id}`;
    } catch (error) {
      console.error(error);
      Utils.showCustomAlert(error.message);
    }
  };

  tableAgenda?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'ver') {
      showDetalhes(id);
    } else if (action === 'editar') {
      startEditing(id);
    } else if (action === 'atender') {
      const item = agendamentos.find((a) => a.id == id);
      if (item && canAttend(item.status)) {
        btn.disabled = true; // evita clique duplo
        criarAtendimento(item);
      } else {
        Utils.showCustomAlert('Este agendamento já está em atendimento ou concluído.');
      }
    }
  });

  // 2. Form Toggle
  if (btnNovoAgendamento && formAgendamento) {
    btnNovoAgendamento.addEventListener('click', () => {
      const isHidden = formAgendamento.classList.contains('form-hidden');
      
      if (editingId) {
          // If we were editing, clicking this acts as a "Cancel Edit"
          limparFormulario(); // This clears editingId
          formAgendamento.classList.add('form-hidden'); // And hide it
          btnNovoAgendamento.textContent = 'Novo Agendamento';
          return;
      }

      if (isHidden) {
        formAgendamento.classList.remove('form-hidden');
        btnNovoAgendamento.textContent = 'Esconder Formulário';
        limparFormulario(); // Ensure clean state
      } else {
        formAgendamento.classList.add('form-hidden');
        btnNovoAgendamento.textContent = 'Novo Agendamento';
        limparFormulario();
      }
    });
  }

  // 3. Modal Close
  btnFecharDetalhes?.addEventListener('click', () => toggleModalDetalhes(false));
  modalDetalhes?.addEventListener('click', (e) => {
      if (e.target === modalDetalhes) toggleModalDetalhes(false);
  });

  // 3.1 Cancelar formulário (botão vermelho)
  btnCancelarForm?.addEventListener('click', () => {
    formAgendamento.classList.add('form-hidden');
    if (btnNovoAgendamento) btnNovoAgendamento.textContent = 'Novo Agendamento';
    if (btnExcluirAgendamento) btnExcluirAgendamento.hidden = true;
    limparFormulario();
  });

  // 3.2 Excluir agendamento (modo edição)
  btnExcluirAgendamento?.addEventListener('click', async () => {
    if (!editingId) return;
    const id = editingId;
    if (!confirm('Deseja excluir este agendamento?')) return;
    try {
      const resp = await fetch(`/api/agendamentos/${id}`, { method: 'DELETE' });
      if (!resp.ok) {
        const info = await resp.json();
        throw new Error(info?.error || 'Erro ao excluir agendamento.');
      }
      agendamentos = agendamentos.filter((a) => a.id != id);
      renderProximos();
      aplicarFiltros();
      limparFormulario();
      formAgendamento.classList.add('form-hidden');
      if (btnNovoAgendamento) btnNovoAgendamento.textContent = 'Novo Agendamento';
      Utils.showCustomAlert('Agendamento excluído.');
    } catch (error) {
      console.error(error);
      Utils.showCustomAlert(error.message);
    }
  });

  // 4. Auto-complete logic (simplified from previous step)
  if (inputTutor) {
    inputTutor.addEventListener('input', () => {
      const client = findCliente(inputTutor.value);
      selectedClienteId = client?.id || null;
      selectedPetId = null;

      if (client && !inputTutor.value.includes('—')) {
        inputTutor.value = formatTutorOption(client);
      }

      if (inputPet) inputPet.value = '';
      if (listPets) listPets.innerHTML = '';
      if (inputEspecie) inputEspecie.value = '';

      if (client && Array.isArray(client.pets) && client.pets.length > 0) {
        if (listPets) {
          listPets.innerHTML = client.pets
            .map((p) => `<option value="${p.nome}">${p.especie || ''}</option>`)
            .join('');
        }
        if (client.pets.length === 1 && inputPet) {
          inputPet.value = client.pets[0].nome;
          inputPet.dispatchEvent(new Event('input'));
        }
      }
    });
  }

  if (inputPet) {
    inputPet.addEventListener('input', () => {
      const tutorName = inputTutor?.value || '';
      const client = findCliente(tutorName);
      if (!client) {
        selectedPetId = null;
        return;
      }
      const pet = getPetFromCliente(client, inputPet.value);
      selectedPetId = pet?.id || null;
      if (pet && inputEspecie) {
        inputEspecie.value = pet.especie || '';
      }
    });
  }

  filtroEspecie?.addEventListener('change', aplicarFiltros);
  filtroPeriodo?.addEventListener('change', aplicarFiltros);
  filtroBusca?.addEventListener('input', Utils.debounce(aplicarFiltros, 200));
  formAgendamento?.addEventListener('submit', onSubmit);

  // Initial loads
  carregarAgendamentos();
  carregarClientes();
})();
