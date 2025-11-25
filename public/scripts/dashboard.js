(() => {
  const periodSelect = document.getElementById('dashboardPeriodo');
  const kpiAtendimentos = document.getElementById('kpiAtendimentos');
  const kpiMediaTempo = document.getElementById('kpiMediaTempo');
  const kpiResolucao = document.getElementById('kpiResolucao');
  const kpiAbandono = document.getElementById('kpiAbandono');
  const atendimentosBody = document.getElementById('ultimosAtendimentosBody');
  const cadastrosBody = document.getElementById('ultimosCadastrosBody');
  const statusDonut = document.getElementById('statusDonut');
  const statusLegend = document.getElementById('statusLegend');

  const statusMap = {
    resolved: { label: 'Resolvido', color: 'var(--success)' },
    in_progress: { label: 'Em andamento', color: 'var(--warning)' },
    pending: { label: 'Pendente', color: 'var(--muted)' },
    cancelled: { label: 'Cancelado', color: 'var(--danger)' },
  };

  const badgeClass = (status = '') => {
    const normalized = status.trim().toLowerCase();
    if (['realizado', 'resolvido', 'compareceu', 'finalizado'].includes(normalized)) {
      return 'badge-success';
    }
    if (['cancelado', 'cancelada', 'faltou', 'no-show'].includes(normalized)) {
      return 'badge-danger';
    }
    if (['agendado', 'programado', 'confirmado', 'em andamento', 'em atendimento'].includes(normalized)) {
      return 'badge-warning';
    }
    return 'badge-neutral';
  };

  const formatDuration = (minutes) => {
    if (!minutes || Number.isNaN(minutes)) return '--';
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  const updateKPIs = (kpis) => {
    if (!kpis) return;
    kpiAtendimentos.textContent = kpis.atendimentos ?? '--';
    kpiMediaTempo.textContent = formatDuration(kpis.mediaDuracaoMin);
    kpiResolucao.textContent = kpis.resolucaoPerc != null ? `${kpis.resolucaoPerc.toFixed(1)}%` : '--';
    kpiAbandono.textContent = kpis.abandonoPerc != null ? `${kpis.abandonoPerc.toFixed(1)}%` : '--';
  };

  const renderAtendimentos = (lista = []) => {
    if (!atendimentosBody) return;
    const rows = lista.map((item) => {
      const data = Utils.formatDate(item.data);
      const hora = Utils.formatTime(item.hora);
      const pet = item.especie ? `${item.pet} (${item.especie})` : item.pet;
      return `
        <tr>
          <td>${data} ${hora}</td>
          <td>${pet || '—'}</td>
          <td>${item.tutor || '—'}</td>
          <td>${item.servico || '—'}</td>
          <td><span class="badge ${badgeClass(item.status)}">${item.status || '—'}</span></td>
        </tr>
      `;
    });
    Utils.renderRows(atendimentosBody, rows, 5, 'Nenhum atendimento encontrado.');
  };

  const renderCadastros = (lista = []) => {
    if (!cadastrosBody) return;
    const rows = lista.map((item) => {
      const data = item.created_at ? Utils.formatDate(item.created_at) : '--';
      const pet = item.pet ? `${item.pet} (${item.especie || '—'})` : '—';
      const contato = Utils.formatPhone(item.telefone || '') || '—';
      return `
        <tr>
          <td>${data}</td>
          <td>${pet}</td>
          <td>${item.nome || '—'}</td>
          <td>${contato}</td>
        </tr>
      `;
    });
    Utils.renderRows(cadastrosBody, rows, 4, 'Nenhum cadastro recente.');
  };

  const updateStatusDonut = (buckets = {}) => {
    if (!statusDonut || !statusLegend) return;
    const total = Object.values(buckets).reduce((acc, curr) => acc + (curr || 0), 0);
    const safeTotal = total || 1;
    const order = ['resolved', 'in_progress', 'pending', 'cancelled'];
    order.forEach((key, index) => {
      const percent = total === 0 ? 0 : Math.round(((buckets[key] || 0) / total) * 100);
      statusDonut.style.setProperty(`--d${index + 1}`, percent);
      statusDonut.style.setProperty(`--c${index + 1}`, statusMap[key].color);
    });

    statusLegend.innerHTML = order
      .map((key) => {
        const percent = Math.round(((buckets[key] || 0) / safeTotal) * 100);
        return `
          <li>
            <span class="dot" style="--dot: ${statusMap[key].color}"></span>
            ${statusMap[key].label} (${percent}%)
          </li>
        `;
      })
      .join('');
  };

  const fetchDashboard = async () => {
    const days = periodSelect?.value || '7';
    try {
      const resp = await fetch(`/api/dashboard?days=${days}`);
      if (!resp.ok) {
        throw new Error('Falha ao carregar dashboard.');
      }
      const data = await resp.json();
      updateKPIs(data.kpis);
      renderAtendimentos(data.ultimosAtendimentos);
      renderCadastros(data.ultimosCadastros);
      updateStatusDonut(data.statusBuckets);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  periodSelect?.addEventListener('change', fetchDashboard);
  fetchDashboard();
})();
