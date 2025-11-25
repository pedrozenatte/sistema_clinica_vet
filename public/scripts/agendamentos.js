(() => {
  const tableProximos = document.getElementById('proximosBody');
  const tableAgenda = document.getElementById('agendaBody');
  const filtroDataDe = document.getElementById('agendaDataDe');
  const filtroDataAte = document.getElementById('agendaDataAte');
  const filtroStatus = document.getElementById('agendaStatus');
  const filtroBusca = document.getElementById('agendaBusca');
  const formAgendamento = document.querySelector('form.card.form');

  const agendamentos = [];

  const badgeClass = (status) => {
    const map = {
      Confirmar: 'badge-warning',
      Agendado: 'badge-success',
      Aguardando: 'badge-neutral',
      Programado: 'badge-neutral',
      Confirmado: 'badge-info',
      Realizado: 'badge-success',
      Cancelado: 'badge-danger',
    };
    return map[status] || 'badge-neutral';
  };

  const renderProximos = () => {
    if (!tableProximos) return;
    const agora = new Date();
    const proximos = agendamentos
      .filter((item) => {
        if (item.destaque) return true;
        const dataHora = new Date(`${item.data}T${item.hora}`);
        return dataHora >= agora && item.status !== 'Cancelado';
      })
      .sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`))
      .slice(0, 3);

    const rows = proximos.map((item) => `
      <tr>
        <td>${Utils.formatDate(item.data)}</td>
        <td>${Utils.formatTime(item.hora)}</td>
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
          <td>${Utils.formatDate(item.data)}</td>
          <td>${Utils.formatTime(item.hora)}</td>
          <td>${item.pet_nome} (${item.especie || '—'})</td>
          <td>${item.tutor_nome}</td>
          <td>${item.servico}</td>
          <td>${item.veterinario}</td>
          <td><span class="badge ${badgeClass(item.status)}">${item.status}</span></td>
          <td>${Utils.formatPhone(item.contato || '')}</td>
        </tr>
      `);

    Utils.renderRows(tableAgenda, rows, 8, 'Nenhum agendamento encontrado.');
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
      const dataAtual = new Date(`${item.data}T${item.hora}`);
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
  };

  const carregarAgendamentos = async () => {
    try {
      const params = new URLSearchParams();
      const resp = await fetch(`/api/agendamentos?${params.toString()}`);
      if (!resp.ok) throw new Error('Falha ao obter agendamentos.');
      const data = await resp.json();
      agendamentos.splice(0, agendamentos.length, ...data);
      renderProximos();
      aplicarFiltros();
    } catch (error) {
      console.error(error);
      alert('Não foi possível carregar os agendamentos.');
    }
  };

  const limparFormulario = (form) => {
    form.reset();
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!formAgendamento) return;
    const dados = new FormData(formAgendamento);
    const payload = {
      tutor_nome: dados.get('tutor') || '',
      pet_nome: dados.get('pet') || '',
      especie: dados.get('especie') || '',
      servico: dados.get('servico') || '',
      veterinario: dados.get('veterinario') || '',
      data: dados.get('data'),
      hora: dados.get('hora'),
      duracao: dados.get('duracao') || '',
      tipo: dados.get('tipo') || '',
      prioridade: dados.get('prioridade') || '',
      status: dados.get('status') || 'Programado',
      canal: dados.get('canal') || 'Telefone',
      observacoes: dados.get('obs') || '',
      contato: '',
      destaque: true,
    };

    if (!payload.pet_nome || !payload.tutor_nome || !payload.data || !payload.hora) {
      alert('Informe tutor, pet, data e hora.');
      return;
    }

    try {
      const resp = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const info = await resp.json();
        throw new Error(info?.error || 'Erro ao criar agendamento.');
      }
      await carregarAgendamentos();
      limparFormulario(formAgendamento);
      alert('Agendamento salvo!');
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  filtroDataDe?.addEventListener('change', aplicarFiltros);
  filtroDataAte?.addEventListener('change', aplicarFiltros);
  filtroStatus?.addEventListener('change', aplicarFiltros);
  filtroBusca?.addEventListener('input', Utils.debounce(aplicarFiltros, 200));
  formAgendamento?.addEventListener('submit', onSubmit);

  carregarAgendamentos();
})();
