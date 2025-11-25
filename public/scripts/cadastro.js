(() => {
  const tableBody = document.getElementById('cadastrosBody');
  const situacaoFiltro = document.getElementById('fSituacao');
  const buscaInput = document.getElementById('fBusca');
  const buscaRapidaInput = document.getElementById('inputBuscaRapida');
  const form = document.getElementById('formCadastro');
  const btnSalvar = document.getElementById('btnSalvarCadastro');
  const btnSalvarBar = document.getElementById('btnSalvarBar');
  const petsContainer = document.getElementById('petsContainer');
  const btnAddPet = document.getElementById('btnAddPet');
  const btnMostrarForm = document.getElementById('btnMostrarForm');
  const btnAbrirModalPet = document.getElementById('btnAbrirModalPet');
  const modalPet = document.getElementById('modalPet');
  const btnFecharModalPet = document.getElementById('btnFecharModalPet');
  const btnCancelarModalPet = document.getElementById('btnCancelarModalPet');
  const formNovoPet = document.getElementById('formNovoPet');
  const formWrapper = document.getElementById('formWrapper');
  const btnCancelarForm = document.getElementById('btnCancelarForm');
  const listaTutores = document.getElementById('listaTutores');
  const modalDetalhes = document.getElementById('modalDetalhes');
  const btnFecharDetalhes = document.getElementById('btnFecharDetalhes');
  const detalhesBody = document.getElementById('detalhesBody');
  const detalhesTitulo = document.getElementById('detalhesTitulo');

  const clientes = [];
  let editingCodigo = null;

  const requiredFields = [
    { name: 'nome', label: 'Nome completo' },
    { name: 'telefone', label: 'Telefone' },
    { name: 'email', label: 'E-mail' },
    { name: 'cpf', label: 'CPF' },
    { name: 'rua', label: 'Logradouro' },
    { name: 'numero', label: 'Nº' },
    { name: 'bairro', label: 'Bairro' },
    { name: 'cep', label: 'CEP' },
    { name: 'cidade', label: 'Cidade' },
    { name: 'pais', label: 'País' },
  ];

  const statusPill = (status) =>
    `<span class="badge ${status === 'Ativo' ? 'badge-success' : 'badge-neutral'}">${status}</span>`;

  const render = (data) => {
    if (!tableBody) return;
    const rows = data.map((cliente) => {
      const contato = Utils.formatPhone(cliente.telefone);
      const petResumo = cliente.pets && cliente.pets.length
        ? cliente.pets
          .map((pet) => {
            const detalhes = [pet.especie, pet.raca].filter(Boolean).join(' — ');
            return `${pet.nome}${detalhes ? ` (${detalhes})` : ''}`;
          })
          .join(', ')
        : '—';
      return `
        <tr data-codigo="${cliente.codigo}">
          <td>${cliente.codigo}</td>
          <td>${cliente.nome}</td>
          <td>${cliente.cpf || '—'}</td>
          <td>${petResumo}</td>
          <td>${contato || '—'}</td>
          <td>${cliente.email || '—'}</td>
          <td>${cliente.cidade || '—'}</td>
          <td>${statusPill(cliente.situacao || 'Ativo')}</td>
          <td>
            <div class="table-actions">
              <button type="button" class="btn btn-ghost btn-small" data-action="view" data-codigo="${cliente.codigo}">Ver</button>
              <button type="button" class="btn btn-ghost btn-small" data-action="edit" data-codigo="${cliente.codigo}">Editar</button>
            </div>
          </td>
        </tr>
      `;
    });

    Utils.renderRows(tableBody, rows, 9, 'Nenhum cadastro encontrado.');
  };

  const normalizar = (texto = '') =>
    texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const filtrar = () => {
    const situacao = situacaoFiltro?.value || '';
    const termo = normalizar(buscaInput?.value || '');

    const resultado = clientes.filter((cliente) => {
      if (situacao && cliente.situacao !== situacao) return false;
      if (!termo) return true;
      const alvo = [
        cliente.nome,
        cliente.cpf,
        cliente.email,
        cliente.cidade,
        ...(cliente.pets || []).map((p) => p.nome),
      ]
        .filter(Boolean)
        .map(normalizar)
        .join(' ');
      return alvo.includes(termo);
    });

    render(resultado);
  };

  const filtrarDebounced = Utils.debounce(filtrar, 200);

  situacaoFiltro?.addEventListener('change', filtrar);
  buscaInput?.addEventListener('input', filtrarDebounced);

  const petRowTemplate = (pet = {}, index = 0) => `
    <div class="pet-row" data-index="${index}">
      <div class="grid g-4">
        <label class="field">
          <span>Nome do Pet <strong class="required">*</strong></span>
          <input type="text" name="pet_nome" value="${pet.nome || ''}" placeholder="Ex.: Luna" />
        </label>
        <label class="field">
          <span>Espécie <strong class="required">*</strong></span>
          <select name="pet_especie">
            <option ${pet.especie === 'Canina' ? 'selected' : ''}>Canina</option>
            <option ${pet.especie === 'Felina' ? 'selected' : ''}>Felina</option>
            <option ${pet.especie === 'Aves' ? 'selected' : ''}>Aves</option>
            <option ${pet.especie === 'Outros' ? 'selected' : ''}>Outros</option>
          </select>
        </label>
        <label class="field field-2">
          <span>Raça</span>
          <input type="text" name="pet_raca" value="${pet.raca || ''}" placeholder="Ex.: SRD" />
        </label>
        <div class="pet-row__actions">
          <button type="button" class="btn btn-ghost btn-small" data-action="remove-pet">Remover</button>
        </div>
      </div>
    </div>
  `;

  const renderPets = (pets = []) => {
    if (!petsContainer) return;
    const lista = pets.length ? pets : [{}];
    petsContainer.innerHTML = lista.map((pet, index) => petRowTemplate(pet, index)).join('');
  };

  const collectPets = () => {
    if (!petsContainer) return [];
    const rows = Array.from(petsContainer.querySelectorAll('.pet-row'));
    return rows
      .map((row) => {
        const nome = row.querySelector('input[name="pet_nome"]')?.value.trim() || '';
        const especie = row.querySelector('select[name="pet_especie"]')?.value.trim() || '';
        const raca = row.querySelector('input[name="pet_raca"]')?.value.trim() || '';
        if (!nome && !especie) return null;
        return { nome, especie, raca };
      })
      .filter(Boolean);
  };

  const ensureAtLeastOnePetRow = () => {
    if (!petsContainer) return;
    if (!petsContainer.querySelector('.pet-row')) {
      renderPets([{}]);
    }
  };

  const setEditingState = (cliente) => {
    editingCodigo = cliente?.codigo || null;
    if (btnSalvar) {
      btnSalvar.textContent = editingCodigo ? 'Atualizar' : 'Salvar';
    }
    if (btnSalvarBar) {
      btnSalvarBar.textContent = editingCodigo ? 'Atualizar cadastro' : 'Salvar cadastro';
    }
  };

  const highlightRow = (codigo) => {
    if (!tableBody) return;
    const row = tableBody.querySelector(`[data-codigo="${codigo}"]`);
    if (!row) return;
    row.classList.add('row-highlight');
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => row.classList.remove('row-highlight'), 1600);
  };

  const carregarClientes = async () => {
    try {
      const resp = await fetch('/api/clientes');
      if (!resp.ok) throw new Error('Falha ao buscar cadastros.');
      const data = await resp.json();
      clientes.splice(0, clientes.length, ...data);
      filtrar();
      atualizarListaTutores();
    } catch (error) {
      console.error(error);
      alert('Não foi possível carregar os cadastros. Verifique o servidor.');
    }
  };

  const sanitize = (value) => (value ? value.trim() : '');

  const buildPayload = () => {
    if (!form) return null;
    const data = new FormData(form);
    const nome = sanitize(data.get('nome'));
    const valores = {
      nome,
      cpf: sanitize(data.get('cpf')),
      email: sanitize(data.get('email')),
      telefone: sanitize(data.get('telefone')),
      situacao: data.get('situacao') || 'Ativo',
      codigo: sanitize(data.get('codigo')) || undefined,
      rua: sanitize(data.get('rua')),
      numero: sanitize(data.get('numero')),
      complemento: sanitize(data.get('complemento')),
      bairro: sanitize(data.get('bairro')),
      cep: sanitize(data.get('cep')),
      cidade: sanitize(data.get('cidade')),
      estado: sanitize(data.get('estado')),
      pais: sanitize(data.get('pais')),
    };

    const payload = {
      nome: valores.nome,
      cpf: valores.cpf,
      email: valores.email,
      telefone: valores.telefone,
      situacao: valores.situacao,
      codigo: valores.codigo,
      rua: valores.rua,
      numero: valores.numero,
      complemento: valores.complemento,
      bairro: valores.bairro,
      cep: valores.cep,
      cidade: valores.cidade,
      estado: valores.estado,
      pais: valores.pais,
    };

    const pets = collectPets();
    const missing = [];

    requiredFields.forEach((field) => {
      if (!valores[field.name]) {
        missing.push(field.label);
      }
    });

    if (!pets.length) {
      missing.push('Pelo menos um pet com Nome e Espécie');
    } else {
      const petsInvalidos = pets.some((p) => !p.nome || !p.especie);
      if (petsInvalidos) missing.push('Pet sem nome ou espécie');
    }

    if (missing.length) {
      alert(`Não é possível concluir o cadastro. Faltam: ${missing.join(', ')}.`);
      return null;
    }

    payload.pets = pets;
    return payload;
  };

  const atualizarClienteLocal = (cliente) => {
    if (!cliente) return;
    const index = clientes.findIndex((item) => item.codigo === cliente.codigo);
    if (index >= 0) {
      clientes[index] = cliente;
    } else {
      clientes.unshift(cliente);
    }
    filtrar();
    highlightRow(cliente.codigo);
  };

  const salvarCliente = async () => {
    const payload = buildPayload();
    if (!payload) return;

    btnSalvar?.setAttribute('disabled', 'disabled');
    btnSalvarBar?.setAttribute('disabled', 'disabled');

    const method = editingCodigo ? 'PUT' : 'POST';
    const url = editingCodigo ? `/api/clientes/${editingCodigo}` : '/api/clientes';

    try {
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const info = await resp.json();
        throw new Error(info?.error || 'Erro ao salvar cadastro.');
      }
      const clienteSalvo = await resp.json();
      form?.reset();
      renderPets([{}]);
      setEditingState(null);
      atualizarClienteLocal(clienteSalvo);
      alert(`Cliente ${clienteSalvo.codigo} salvo com sucesso!`);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      btnSalvar?.removeAttribute('disabled');
      btnSalvarBar?.removeAttribute('disabled');
    }
  };

  window.buscarClientePorCodigoRapido = () => {
    const codigo = buscaRapidaInput?.value.trim();
    if (!codigo) {
      alert('Informe um código para buscar.');
      return;
    }
    const encontrado = clientes.find((cliente) => cliente.codigo === codigo);
    if (!encontrado) {
      alert(`Nenhum cliente com o código ${codigo}.`);
      return;
    }
    if (buscaInput) {
      buscaInput.value = encontrado.nome;
    }
    filtrar();
    highlightRow(codigo);
  };

  window.deletarClientePorCodigo = async () => {
    const codigo = buscaRapidaInput?.value.trim();
    if (!codigo) {
      alert('Informe o código a ser removido.');
      return;
    }
    const confirma = confirm(
      `Deseja realmente remover o cadastro #${codigo}? Esta ação impactará sua base no Supabase.`,
    );
    if (!confirma) return;

    try {
      const resp = await fetch(`/api/clientes/${codigo}`, { method: 'DELETE' });
      if (!resp.ok) {
        const payload = await resp.json();
        throw new Error(payload?.error || 'Falha ao deletar.');
      }
      const index = clientes.findIndex((cliente) => cliente.codigo === codigo);
      if (index >= 0) {
        clientes.splice(index, 1);
        filtrar();
      }
      if (editingCodigo === codigo) {
        form?.reset();
        renderPets([{}]);
        setEditingState(null);
      }
      alert(`Cliente ${codigo} removido.`);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const preencherFormulario = (cliente) => {
    if (!form || !cliente) return;
    form.reset();
    abrirFormulario();
    form.querySelector('input[name="nome"]').value = cliente.nome || '';
    form.querySelector('input[name="cpf"]').value = cliente.cpf || '';
    form.querySelector('input[name="telefone"]').value = cliente.telefone || '';
    form.querySelector('input[name="email"]').value = cliente.email || '';
    form.querySelector('input[name="codigo"]').value = cliente.codigo || '';
    form.querySelector('input[name="rua"]').value = cliente.rua || '';
    form.querySelector('input[name="numero"]').value = cliente.numero || '';
    form.querySelector('input[name="complemento"]').value = cliente.complemento || '';
    form.querySelector('input[name="bairro"]').value = cliente.bairro || '';
    form.querySelector('input[name="cep"]').value = cliente.cep || '';
    form.querySelector('input[name="cidade"]').value = cliente.cidade || '';
    const selectEstado = form.querySelector('select[name="estado"]');
    if (selectEstado) {
      const valorEstado = (cliente.estado || '').trim().toUpperCase();
      const existe = Array.from(selectEstado.options).some((opt) => opt.value === valorEstado);
      if (!existe && valorEstado) {
        const opt = document.createElement('option');
        opt.value = valorEstado;
        opt.textContent = valorEstado;
        selectEstado.appendChild(opt);
      }
      selectEstado.value = valorEstado;
    }
    form.querySelector('input[name="pais"]').value = cliente.pais || '';
    const situacao = form.querySelector('select[name="situacao"]');
    if (situacao) situacao.value = cliente.situacao || 'Ativo';

    renderPets(cliente.pets || [{}]);
    setEditingState(cliente);
    highlightRow(cliente.codigo);
  };

  const carregarClienteParaEdicao = async (codigo) => {
    try {
      const resp = await fetch(`/api/clientes/${codigo}`);
      if (!resp.ok) throw new Error('Cliente não encontrado.');
      const cliente = await resp.json();
      preencherFormulario(cliente);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const renderDetalhes = (cliente) => {
    if (!detalhesBody || !detalhesTitulo) return;
    detalhesTitulo.textContent = `${cliente.nome || 'Cliente'} — ${cliente.codigo || ''}`;

    const endereco = [
      cliente.rua,
      cliente.numero,
      cliente.complemento,
      cliente.bairro,
      cliente.cidade,
      cliente.estado,
      cliente.cep,
      cliente.pais,
    ]
      .filter(Boolean)
      .join(', ');

    const petsLista = (cliente.pets || []).map((pet) => {
      const detalhes = [pet.especie, pet.raca].filter(Boolean).join(' — ');
      return `<li><strong>${pet.nome}</strong>${detalhes ? ` (${detalhes})` : ''}</li>`;
    });

    detalhesBody.innerHTML = `
      <div class="detail-grid">
        <div>
          <span class="detail-label">Código</span>
          <strong class="detail-value">${cliente.codigo || '—'}</strong>
        </div>
        <div>
          <span class="detail-label">Situação</span>
          <strong class="detail-value">${cliente.situacao || '—'}</strong>
        </div>
        <div class="detail-full">
          <span class="detail-label">Nome</span>
          <strong class="detail-value">${cliente.nome || '—'}</strong>
        </div>
        <div>
          <span class="detail-label">CPF</span>
          <strong class="detail-value">${cliente.cpf || '—'}</strong>
        </div>
        <div>
          <span class="detail-label">Telefone</span>
          <strong class="detail-value">${Utils.formatPhone(cliente.telefone || '') || '—'}</strong>
        </div>
        <div class="detail-full">
          <span class="detail-label">E-mail</span>
          <strong class="detail-value">${cliente.email || '—'}</strong>
        </div>
        <div class="detail-full">
          <span class="detail-label">Endereço</span>
          <strong class="detail-value">${endereco || '—'}</strong>
        </div>
        <div class="detail-full">
          <span class="detail-label">Pets</span>
          ${
            petsLista.length
              ? `<ul class="detail-list">${petsLista.join('')}</ul>`
              : '<strong class="detail-value">—</strong>'
          }
        </div>
      </div>
    `;
  };

  const toggleModalDetalhes = (open) => {
    if (!modalDetalhes) return;
    if (open) modalDetalhes.removeAttribute('hidden');
    else modalDetalhes.setAttribute('hidden', 'hidden');
  };

  const carregarClienteParaVisualizacao = async (codigo) => {
    try {
      const resp = await fetch(`/api/clientes/${codigo}`);
      if (!resp.ok) throw new Error('Cliente não encontrado.');
      const cliente = await resp.json();
      renderDetalhes(cliente);
      toggleModalDetalhes(true);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  tableBody?.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-codigo]');
    if (!btn) return;
    event.preventDefault();
    const codigo = btn.getAttribute('data-codigo');
    const action = btn.getAttribute('data-action');
    if (action === 'view') {
      carregarClienteParaVisualizacao(codigo);
    } else {
      carregarClienteParaEdicao(codigo);
    }
  });

  form?.addEventListener('reset', () => {
    setEditingState(null);
    renderPets([{}]);
  });

  const abrirFormulario = () => {
    if (!formWrapper) return;
    formWrapper.removeAttribute('hidden');
    formWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const fecharFormulario = () => {
    if (!formWrapper) return;
    formWrapper.setAttribute('hidden', 'hidden');
    setEditingState(null);
    form?.reset();
    renderPets([{}]);
  };

  btnMostrarForm?.addEventListener('click', () => {
    abrirFormulario();
    setEditingState(null);
    form?.reset();
    renderPets([{}]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  btnCancelarForm?.addEventListener('click', () => {
    fecharFormulario();
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    salvarCliente();
  });

  btnSalvar?.addEventListener('click', salvarCliente);
  btnSalvarBar?.addEventListener('click', salvarCliente);
  btnAddPet?.addEventListener('click', () => {
    const currentPets = collectPets();
    currentPets.push({});
    renderPets(currentPets);
  });

  btnFecharDetalhes?.addEventListener('click', () => toggleModalDetalhes(false));
  modalDetalhes?.addEventListener('click', (event) => {
    if (event.target === modalDetalhes) {
      toggleModalDetalhes(false);
    }
  });

  const toggleModalPet = (open) => {
    if (!modalPet) return;
    if (open) {
      modalPet.removeAttribute('hidden');
    } else {
      modalPet.setAttribute('hidden', 'hidden');
    }
  };

  const salvarNovoPet = async (event) => {
    event.preventDefault();
    if (!formNovoPet) return;
    const data = new FormData(formNovoPet);
    const codigo = extrairCodigoTutor(data.get('codigo') || '');
    const nome = (data.get('pet_nome') || '').trim();
    const especie = (data.get('pet_especie') || '').trim();
    const raca = (data.get('pet_raca') || '').trim();

    const faltantes = [];
    if (!codigo) faltantes.push('Código do tutor');
    if (!nome) faltantes.push('Nome do pet');
    if (!especie) faltantes.push('Espécie');

    if (faltantes.length) {
      alert(`Preencha: ${faltantes.join(', ')}.`);
      return;
    }

    const submitBtn = formNovoPet.querySelector('button[type="submit"]');
    submitBtn?.setAttribute('disabled', 'disabled');

    try {
      const resp = await fetch(`/api/clientes/${codigo}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, especie, raca }),
      });
      if (!resp.ok) {
        const info = await resp.json();
        throw new Error(info?.error || 'Erro ao salvar pet.');
      }
      await resp.json();
      alert(`Pet adicionado ao cliente ${codigo}.`);
      formNovoPet.reset();
      toggleModalPet(false);
      carregarClientes();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      submitBtn?.removeAttribute('disabled');
    }
  };

  btnAbrirModalPet?.addEventListener('click', () => toggleModalPet(true));
  btnFecharModalPet?.addEventListener('click', () => toggleModalPet(false));
  btnCancelarModalPet?.addEventListener('click', () => {
    formNovoPet?.reset();
    toggleModalPet(false);
  });
  formNovoPet?.addEventListener('submit', salvarNovoPet);

  petsContainer?.addEventListener('click', (event) => {
    const action = event.target.dataset.action;
    if (action === 'remove-pet') {
      const row = event.target.closest('.pet-row');
      row?.remove();
      ensureAtLeastOnePetRow();
    }
  });

  const atualizarListaTutores = () => {
    if (!listaTutores) return;
    const options = clientes
      .map((c) => `<option value="${c.codigo} — ${c.nome}"></option>`)
      .join('');
    listaTutores.innerHTML = options;
  };

  const extrairCodigoTutor = (valor) => {
    if (!valor) return '';
    const match = valor.trim().match(/^(\S+)/);
    return match ? match[1] : valor.trim();
  };

  carregarClientes();
  ensureAtLeastOnePetRow();
})();
