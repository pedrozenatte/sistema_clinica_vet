(() => {
  const tableBody = document.getElementById('atendimentosBody');
  const form = document.getElementById('formAtendimento');
  const btnNovo = document.getElementById('btnNovoAtendimento');
  const filtroStatus = document.getElementById('atdFiltroStatus');
  const filtroBusca = document.getElementById('atdBusca');
  const countLabel = document.getElementById('atdCount');
  const listaTutores = document.getElementById('listaAtdTutores');
  const listaPets = document.getElementById('listaAtdPets');

  let atendimentos = [];
  let clientes = [];
  let editingId = null;
  let selectedClienteId = null;
  let selectedPetId = null;
  let selectedAgendamentoId = null;

  const badgeClass = (status = '') => {
    const map = {
      'Em atendimento': 'badge-warning',
      Finalizado: 'badge-success',
      Cancelado: 'badge-danger',
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
    if (value instanceof Date) return value.toISOString().slice(11, 16);
    return '';
  };

  const displayDate = (value) => {
    const normalized = normalizeDateValue(value);
    return normalized ? Utils.formatDate(normalized) : '--';
  };

  const displayTime = (value) => normalizeTimeValue(value) || '--';

  const parsePrescricaoInput = (value = '') =>
    value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

  const stringifyPrescricao = (value) => {
    if (Array.isArray(value)) return value.join('\n');
    if (typeof value === 'string') return value;
    return '';
  };

  const normalize = (value = '') =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const resetSelections = () => {
    selectedClienteId = null;
    selectedPetId = null;
    selectedAgendamentoId = null;
  };

  const getClienteByNome = (nome = '') => {
    if (!nome) return null;
    return clientes.find((cliente) => (cliente.nome || '').toLowerCase() === nome.toLowerCase());
  };

  const getPetFromCliente = (cliente, petNome = '') => {
    if (!cliente || !Array.isArray(cliente.pets)) return null;
    return cliente.pets.find((pet) => (pet.nome || '').toLowerCase() === petNome.toLowerCase());
  };

  const renderTabela = (data) => {
    if (!tableBody) return;
    const rows = data
      .sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`))
      .map(
        (item) => `
        <tr data-id="${item.id}">
          <td>${displayDate(item.data)}</td>
          <td>${displayTime(item.hora)}</td>
          <td>${item.pet_nome} (${item.especie || '—'})</td>
          <td>${item.tutor_nome}</td>
          <td>${item.veterinario || '—'}</td>
          <td><span class="badge ${badgeClass(item.status)}">${item.status}</span></td>
          <td>
            <div class="table-actions">
              <button class="btn-small btn-small-ghost" data-id="${item.id}" data-action="editar">Editar</button>
              <button class="btn-small" data-id="${item.id}" data-action="excluir">Excluir</button>
            </div>
          </td>
        </tr>
      `,
      );

    Utils.renderRows(tableBody, rows, 7, 'Nenhum atendimento registrado.');
  };

  const aplicarFiltros = () => {
    const statusFiltro = filtroStatus?.value || '';
    const busca = normalize(filtroBusca?.value || '');

    const filtrados = atendimentos.filter((item) => {
      if (statusFiltro && item.status !== statusFiltro) return false;
      if (!busca) return true;
      const alvo = [item.pet_nome, item.tutor_nome, item.veterinario]
        .filter(Boolean)
        .map(normalize)
        .join(' ');
      return alvo.includes(busca);
    });

    renderTabela(filtrados);
    if (countLabel) {
      countLabel.textContent = filtrados.length === 1 ? '1 registro' : `${filtrados.length} registros`;
    }
  };

  const carregarAtendimentos = async () => {
    try {
      const resp = await fetch('/api/atendimentos');
      if (!resp.ok) throw new Error('Falha ao carregar atendimentos.');
      atendimentos = await resp.json();
      aplicarFiltros();
      destacarFoco();
    } catch (error) {
      console.error(error);
      alert('Não foi possível carregar os atendimentos.');
    }
  };

  const carregarClientes = async () => {
    try {
      const resp = await fetch('/api/clientes');
      if (!resp.ok) throw new Error('Falha ao carregar clientes.');
      clientes = await resp.json();
      if (listaTutores) {
        listaTutores.innerHTML = clientes
          .map((cliente) => `<option value="${cliente.nome}">${cliente.codigo || ''}</option>`)
          .join('');
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const destacarFoco = () => {
    const params = new URLSearchParams(window.location.search);
    const focusId = params.get('focus');
    if (!focusId || !tableBody) return;
    const row = tableBody.querySelector(`tr[data-id="${focusId}"]`);
    if (row) {
      row.classList.add('row-highlight');
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => row.classList.remove('row-highlight'), 1800);
    }
    params.delete('focus');
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  };

  const preencherFormulario = (item) => {
    if (!form) return;
    const tutorInput = form.querySelector('[name="tutor"]');
    const petInput = form.querySelector('[name="pet"]');
    const especieSelect = form.querySelector('[name="especie"]');

    const cliente = getClienteByNome(item.tutor_nome || '');
    selectedClienteId = item.cliente_id || cliente?.id || null;
    if (listaPets) {
      if (cliente && Array.isArray(cliente.pets)) {
        listaPets.innerHTML = cliente.pets
          .map((pet) => `<option value="${pet.nome}">${pet.especie || ''}</option>`)
          .join('');
      } else {
        listaPets.innerHTML = '';
      }
    }
    selectedPetId = item.pet_id || getPetFromCliente(cliente, item.pet_nome || '')?.id || null;
    selectedAgendamentoId = item.agendamento_id || null;

    if (tutorInput) tutorInput.value = item.tutor_nome || '';
    if (petInput) petInput.value = item.pet_nome || '';
    if (especieSelect) especieSelect.value = item.especie || 'Canina';
    form.querySelector('[name="veterinario"]').value = item.veterinario || '';
    form.querySelector('[name="data"]').value = normalizeDateValue(item.data) || '';
    form.querySelector('[name="hora"]').value = normalizeTimeValue(item.hora) || '';
    form.querySelector('[name="tipo"]').value = item.tipo || 'Consulta';
    form.querySelector('[name="status"]').value = item.status || 'Em atendimento';
    form.querySelector('[name="anamnese"]').value = item.anamnese || '';
    form.querySelector('[name="exame_obs"]').value = item.exame_obs || '';
    form.querySelector('[name="hipoteses"]').value = item.hipoteses || '';
    form.querySelector('[name="exames"]').value = item.exames || '';
    form.querySelector('[name="prescricao"]').value = stringifyPrescricao(item.prescricao);
  };

  const startEditing = (id) => {
    const item = atendimentos.find((atd) => atd.id == id);
    if (!item) return;
    editingId = id;
    if (form) {
      form.classList.remove('form-hidden');
      preencherFormulario(item);
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (btnNovo) {
      btnNovo.textContent = 'Cancelar edição';
    }
  };

  const limparFormulario = () => {
    if (!form) return;
    form.reset();
    resetSelections();
    editingId = null;
    if (btnNovo) {
      const hidden = form.classList.contains('form-hidden');
      btnNovo.textContent = hidden ? 'Novo atendimento' : 'Esconder formulário';
    }
    if (listaPets) listaPets.innerHTML = '';
  };

  const deletarAtendimento = async (id) => {
    if (!id) return;
    const confirma = confirm('Deseja realmente excluir este atendimento?');
    if (!confirma) return;
    try {
      const resp = await fetch(`/api/atendimentos/${id}`, { method: 'DELETE' });
      if (!resp.ok) {
        const info = await resp.json();
        throw new Error(info?.error || 'Erro ao excluir atendimento.');
      }
      await carregarAtendimentos();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form) return;
    const dados = new FormData(form);
    const dataNormalizada = normalizeDateValue(dados.get('data'));
    const horaNormalizada = normalizeTimeValue(dados.get('hora'));

    const payload = {
      agendamento_id: selectedAgendamentoId,
      cliente_id: selectedClienteId,
      pet_id: selectedPetId,
      tutor_nome: dados.get('tutor') || '',
      pet_nome: dados.get('pet') || '',
      especie: dados.get('especie') || '',
      veterinario: dados.get('veterinario') || '',
      tipo: dados.get('tipo') || 'Consulta',
      status: dados.get('status') || 'Em atendimento',
      data: dataNormalizada,
      hora: horaNormalizada,
      anamnese: dados.get('anamnese') || '',
      exame_obs: dados.get('exame_obs') || '',
      hipoteses: dados.get('hipoteses') || '',
      exames: dados.get('exames') || '',
      prescricao: parsePrescricaoInput(dados.get('prescricao') || ''),
    };

    if (!payload.tutor_nome || !payload.pet_nome || !payload.data || !payload.hora) {
      alert('Informe tutor, pet, data e hora.');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/atendimentos/${editingId}` : '/api/atendimentos';
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const info = await resp.json();
        throw new Error(info?.error || 'Erro ao salvar atendimento.');
      }
      await resp.json();
      form.classList.add('form-hidden');
      limparFormulario();
      await carregarAtendimentos();
      alert('Atendimento salvo com sucesso!');
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const toggleForm = () => {
    if (!form) return;
    const hidden = form.classList.contains('form-hidden');
    if (hidden) {
      form.classList.remove('form-hidden');
      limparFormulario();
    } else {
      form.classList.add('form-hidden');
      limparFormulario();
    }
  };

  tableBody?.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'editar') {
      startEditing(id);
    } else if (action === 'excluir') {
      deletarAtendimento(id);
    }
  });

  btnNovo?.addEventListener('click', () => {
    if (editingId) {
      limparFormulario();
      form.classList.add('form-hidden');
      btnNovo.textContent = 'Novo atendimento';
      return;
    }
    toggleForm();
    btnNovo.textContent = form.classList.contains('form-hidden') ? 'Novo atendimento' : 'Esconder formulário';
  });

  form?.addEventListener('submit', onSubmit);
  form?.addEventListener('reset', resetSelections);

  filtroStatus?.addEventListener('change', aplicarFiltros);
  filtroBusca?.addEventListener('input', Utils.debounce(aplicarFiltros, 200));

  const tutorInput = form?.querySelector('[name="tutor"]');
  const petInput = form?.querySelector('[name="pet"]');
  const especieSelect = form?.querySelector('[name="especie"]');

  tutorInput?.addEventListener('input', () => {
    const cliente = getClienteByNome(tutorInput.value);
    selectedClienteId = cliente?.id || null;
    selectedPetId = null;
    if (listaPets) {
      if (cliente && Array.isArray(cliente.pets)) {
        listaPets.innerHTML = cliente.pets
          .map((pet) => `<option value="${pet.nome}">${pet.especie || ''}</option>`)
          .join('');
      } else {
        listaPets.innerHTML = '';
      }
    }
    if (petInput) petInput.value = '';
    if (especieSelect) especieSelect.value = 'Canina';
  });

  petInput?.addEventListener('input', () => {
    const cliente = getClienteByNome(tutorInput?.value || '');
    const pet = getPetFromCliente(cliente, petInput.value);
    selectedPetId = pet?.id || null;
    if (pet && especieSelect) {
      especieSelect.value = pet.especie || '';
    }
  });

  carregarAtendimentos();
  carregarClientes();
})();
