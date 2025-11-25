(() => {
  const tableBody = document.getElementById('cadastrosBody');
  const situacaoFiltro = document.getElementById('fSituacao');
  const buscaInput = document.getElementById('fBusca');
  const buscaRapidaInput = document.getElementById('inputBuscaRapida');
  const form = document.getElementById('formCadastro');
  const btnSalvar = document.getElementById('btnSalvarCadastro');

  const clientes = [];

  const statusPill = (status) =>
    `<span class="badge ${status === 'Ativo' ? 'badge-success' : 'badge-neutral'}">${status}</span>`;

  const render = (data) => {
    if (!tableBody) return;
    const rows = data.map((cliente) => {
      const contato = Utils.formatPhone(cliente.telefone);
      const petResumo = cliente.pets && cliente.pets.length
        ? `${cliente.pets[0].nome} (${cliente.pets[0].especie || '—'})`
        : '—';
      return `
        <tr data-codigo="${cliente.codigo}">
          <td>${cliente.codigo}</td>
          <td>${cliente.nome}</td>
          <td>${cliente.cpf || '—'}</td>
          <td>${petResumo}</td>
          <td>${contato || '—'}</td>
          <td>${cliente.email || '—'}</td>
          <td>${cliente.cidade ? `${cliente.cidade}/${cliente.uf || ''}` : '—'}</td>
          <td>${statusPill(cliente.situacao || 'Ativo')}</td>
          <td>
            <button type="button" class="btn btn-ghost" data-codigo="${cliente.codigo}">Editar</button>
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
        cliente.uf,
        cliente?.pets?.[0]?.nome,
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
    const payload = {
      nome,
      cpf: sanitize(data.get('cpf')),
      email: sanitize(data.get('email')),
      telefone: sanitize(data.get('telefone')),
      situacao: 'Ativo',
    };

    const petNome = sanitize(data.get('pet_nome'));
    const petEspecie = sanitize(data.get('pet_especie'));
    if (petNome) {
      payload.pet = { nome: petNome, especie: petEspecie || null };
    }
    return payload;
  };

  const adicionarClienteLocal = (cliente) => {
    if (!cliente) return;
    clientes.unshift(cliente);
    filtrar();
    highlightRow(cliente.codigo);
  };

  const salvarCliente = async () => {
    const payload = buildPayload();
    if (!payload) return;
    if (!payload.nome) {
      alert('Preencha o campo Nome.');
      return;
    }
    btnSalvar?.setAttribute('disabled', 'disabled');

    try {
      const resp = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const info = await resp.json();
        throw new Error(info?.error || 'Erro ao salvar cadastro.');
      }
      const clienteCriado = await resp.json();
      form?.reset();
      adicionarClienteLocal(clienteCriado);
      alert(`Cliente ${clienteCriado.codigo} salvo com sucesso!`);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      btnSalvar?.removeAttribute('disabled');
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
      alert(`Cliente ${codigo} removido.`);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    salvarCliente();
  });

  btnSalvar?.addEventListener('click', salvarCliente);

  carregarClientes();
})();
