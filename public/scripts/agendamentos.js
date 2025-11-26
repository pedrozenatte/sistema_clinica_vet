(() => {
  const tableProximos = document.getElementById('proximosBody');
  const tableAgenda = document.getElementById('agendaBody');
  const filtroDataDe = document.getElementById('agendaDataDe');
  const filtroDataAte = document.getElementById('agendaDataAte');
  const filtroStatus = document.getElementById('agendaStatus');
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
  
  // Modal elements
  const modalDetalhes = document.getElementById('modalDetalhes');
  const btnFecharDetalhes = document.getElementById('btnFecharDetalhes');
  const detalhesBody = document.getElementById('detalhesBody');
  
  let agendamentos = [];
  let clientesData = []; 
  let editingId = null; // Tracks the ID being edited

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
        <td>${item.veterinario}</td>
        <td><span class="badge ${badgeClass(item.status)}">${item.status}</span></td>
      </tr>
    `);

    Utils.renderRows(tableProximos, rows, 7, 'Nenhum agendamento próximo.');
  };

  const renderAgenda = (data) => {
    if (!tableAgenda) return;
    const rows = data
      .sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`))
      .map((item) => `
        <tr>
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
              <button class="btn-small btn-small-ghost" data-id="${item.id}" data-action="ver">Ver</button>
              <button class="btn-small" data-id="${item.id}" data-action="editar">Editar</button>
            </div>
          </td>
        </tr>
      `);

    Utils.renderRows(tableAgenda, rows, 9, 'Nenhum agendamento encontrado.');
  };

  const normalizar = (valor = '') =>
    valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const aplicarFiltros = () => {
    const inicio = filtroDataDe?.value ? new Date(`${filtroDataDe.value}T00:00:00`) : null;
    const fim = filtroDataAte?.value ? new Date(`${filtroDataAte.value}T23:59:59`) : null;
    const status = filtroStatus?.value || '';
    const busca = normalizar(filtroBusca?.value || '');

    const filtrados = agendamentos.filter((item) => {
      const dataAtual = getDateTime(item);
      if (Number.isNaN(dataAtual)) return false;
      if (inicio && dataAtual < inicio) return false;
      if (fim && dataAtual > fim) return false;
      if (status && item.status !== status) return false;
      if (!busca) return true;
      const alvo = [item.pet_nome, item.tutor_nome, item.servico, item.veterinario]
        .map(normalizar)
        .join(' ');
      return alvo.includes(busca);
    });

    renderAgenda(filtrados);
    if (agendaCountLabel) {
      agendaCountLabel.textContent =
        filtrados.length === 1 ? '1 registro' : `${filtrados.length} registros`;
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
      alert('Não foi possível carregar os agendamentos.');
    }
  };

  const carregarClientes = async () => {
    try {
      const resp = await fetch('/api/clientes');
      if (!resp.ok) throw new Error('Falha ao carregar clientes.');
      clientesData = await resp.json();
      if (listTutores) {
        listTutores.innerHTML = clientesData
          .map(c => `<option value="${c.nome}">${c.cpf ? `CPF: ${c.cpf}` : ''}</option>`)
          .join('');
      }
    } catch (error) {
      console.error('Erro carregando clientes:', error);
    }
  };

  // --- Modal Logic (Ver) ---
  const toggleModalDetalhes = (open) => {
    if (!modalDetalhes) return;
    if (open) modalDetalhes.removeAttribute('hidden');
    else modalDetalhes.setAttribute('hidden', 'hidden');
  };

  const showDetalhes = (id) => {
    const item = agendamentos.find(a => a.id == id); // Loose equality in case of string/number mismatch
    if (!item) return;

    if (detalhesBody) {
        detalhesBody.innerHTML = `
            <div class="detail-grid">
                <div><span class="detail-label">Data</span><strong class="detail-value">${displayDate(item.data)}</strong></div>
                <div><span class="detail-label">Hora</span><strong class="detail-value">${displayTime(item.hora)}</strong></div>
                
                <div><span class="detail-label">Tutor</span><strong class="detail-value">${item.tutor_nome}</strong></div>
                <div><span class="detail-label">Contato</span><strong class="detail-value">${Utils.formatPhone(item.contato)}</strong></div>

                <div><span class="detail-label">Pet</span><strong class="detail-value">${item.pet_nome}</strong></div>
                <div><span class="detail-label">Espécie</span><strong class="detail-value">${item.especie || '-'}</strong></div>

                <div><span class="detail-label">Serviço</span><strong class="detail-value">${item.servico}</strong></div>
                <div><span class="detail-label">Veterinário</span><strong class="detail-value">${item.veterinario}</strong></div>

                <div><span class="detail-label">Status</span><strong class="detail-value">${item.status}</strong></div>
                <div><span class="detail-label">Duração</span><strong class="detail-value">${item.duracao || '-'}</strong></div>

                <div class="detail-full"><span class="detail-label">Observações</span><p>${item.observacoes || '—'}</p></div>
            </div>
        `;
    }
    toggleModalDetalhes(true);
  };

  // --- Edit Logic ---
  const startEditing = (id) => {
    const item = agendamentos.find(a => a.id == id);
    if (!item) return;

    // 1. Open form if closed
    if (formAgendamento.classList.contains('form-hidden')) {
        formAgendamento.classList.remove('form-hidden');
        btnNovoAgendamento.textContent = 'Cancelar Edição';
    }

    // 2. Populate fields
    editingId = id;
    if (formTitle) formTitle.textContent = 'Editar Agendamento';
    
    const f = formAgendamento;
    f.querySelector('[name="tutor"]').value = item.tutor_nome || '';
    f.querySelector('[name="pet"]').value = item.pet_nome || '';
    f.querySelector('[name="especie"]').value = item.especie || 'Canina';
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
    
    // Scroll to form
    formAgendamento.scrollIntoView({ behavior: 'smooth' });
  };

  const limparFormulario = () => {
    if (!formAgendamento) return;
    formAgendamento.reset();
    editingId = null;
    if (formTitle) formTitle.textContent = 'Novo Agendamento';
    if (btnNovoAgendamento) {
        // Reset button text based on visibility
        const isHidden = formAgendamento.classList.contains('form-hidden');
        btnNovoAgendamento.textContent = isHidden ? 'Novo Agendamento' : 'Esconder Formulário';
    }
    // Clear specific inputs manually if reset() doesn't catch them all (though it should)
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!formAgendamento) return;
    const dados = new FormData(formAgendamento);
    
    // Helper to get contact
    const getContact = () => {
        const name = dados.get('tutor');
        const client = clientesData.find(c => c.nome === name);
        return client ? (client.telefone || client.email) : '';
    };

    const dataValor = normalizeDateValue(dados.get('data'));
    const horaValor = normalizeTimeValue(dados.get('hora'));

    const payload = {
      tutor_nome: dados.get('tutor') || '',
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
      alert('Informe tutor, pet, data e hora.');
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

      await carregarAgendamentos();
      
      // Hide and reset
      formAgendamento.classList.add('form-hidden');
      limparFormulario(); 
      
      alert('Agendamento salvo!');
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // --- Event Listeners ---

  // 1. Table Actions (Ver / Editar)
  tableAgenda?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;

      if (action === 'ver') {
          showDetalhes(id);
      } else if (action === 'editar') {
          startEditing(id);
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

  // 4. Auto-complete logic (simplified from previous step)
  if (inputTutor) {
    inputTutor.addEventListener('input', () => {
      const name = inputTutor.value;
      const client = clientesData.find(c => c.nome === name);
      
      // Reset pet fields
      if (inputPet) inputPet.value = '';
      if (listPets) listPets.innerHTML = '';
      if (inputEspecie) inputEspecie.value = '';

      if (client && client.pets && client.pets.length > 0) {
          if (listPets) {
             listPets.innerHTML = client.pets.map(p => `<option value="${p.nome}">${p.especie}</option>`).join('');
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
          const tutorName = inputTutor.value;
          const client = clientesData.find(c => c.nome === tutorName);
          if (!client) return;
          const pet = client.pets.find(p => p.nome === inputPet.value);
          if (pet && inputEspecie) {
              // Try to set species
              inputEspecie.value = pet.especie; // Simplified for now
          }
      });
  }

  filtroDataDe?.addEventListener('change', aplicarFiltros);
  filtroDataAte?.addEventListener('change', aplicarFiltros);
  filtroStatus?.addEventListener('change', aplicarFiltros);
  filtroBusca?.addEventListener('input', Utils.debounce(aplicarFiltros, 200));
  formAgendamento?.addEventListener('submit', onSubmit);

  // Initial loads
  carregarAgendamentos();
  carregarClientes();
})();
