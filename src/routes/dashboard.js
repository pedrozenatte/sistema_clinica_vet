import { Router } from 'express';
import { supabase } from '../lib/supabaseClient.js';

const router = Router();
const DEFAULT_DAYS = 7;
const MAX_DAYS = 90;

const clampDays = (value) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return DEFAULT_DAYS;
  return Math.min(parsed, MAX_DAYS);
};

const mapStatusBucket = (status = '') => {
  const normalized = status.trim().toLowerCase();
  if (['realizado', 'resolvido', 'compareceu', 'concluido', 'concluído', 'finalizado'].includes(normalized)) {
    return 'resolved';
  }
  if (['cancelado', 'cancelada', 'cancelar', 'faltou', 'no-show', 'abandonado'].includes(normalized)) {
    return 'cancelled';
  }
  if (['agendado', 'programado', 'em andamento', 'em atendimento', 'confirmado'].includes(normalized)) {
    return 'in_progress';
  }
  return 'pending';
};

const parseDurationToMinutes = (value) => {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const match = value.match(/(\d+)/);
    if (match) return Number(match[1]);
  }
  return null;
};

router.get('/', async (req, res) => {
  const days = clampDays(req.query.days);
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - (days - 1));
  const startDateISO = start.toISOString().slice(0, 10);
  const endDateISO = now.toISOString().slice(0, 10);

  try {
    const [agendamentosRes, atendimentosCountRes, ultimosAtendimentosRes, ultimosClientesRes] = await Promise.all([
      supabase
        .from('agendamentos')
        .select('id,data,hora,pet_nome,especie,tutor_nome,servico,veterinario,status,contato,duracao')
        .gte('data', startDateISO)
        .lte('data', endDateISO),
      supabase
        .from('atendimentos')
        .select('id', { count: 'exact', head: true })
        .gte('data', startDateISO)
        .lte('data', endDateISO),
      supabase
        .from('atendimentos')
        .select('data,hora,pet_nome,especie,tutor_nome,servico,status')
        .order('data', { ascending: false })
        .order('hora', { ascending: false })
        .limit(4),
      supabase
        .from('clientes')
        .select('codigo,nome,telefone,created_at,pets ( nome, especie )')
        .order('created_at', { ascending: false, nullsFirst: false })
        .limit(4),
    ]);

    // Fallback para clientes caso created_at não exista
    let ultimosClientesData = ultimosClientesRes.data;
    if (ultimosClientesRes.error && /created_at/.test(ultimosClientesRes.error.message)) {
      const fallback = await supabase
        .from('clientes')
        .select('codigo,nome,telefone,pets ( nome, especie )')
        .order('codigo', { ascending: false })
        .limit(4);
      if (fallback.error) {
        return res.status(500).json({ error: fallback.error.message });
      }
      ultimosClientesData = fallback.data;
    } else if (ultimosClientesRes.error) {
      return res.status(500).json({ error: ultimosClientesRes.error.message });
    }

    if (agendamentosRes.error) {
      return res.status(500).json({ error: agendamentosRes.error.message });
    }

    if (atendimentosCountRes.error) {
      return res.status(500).json({ error: atendimentosCountRes.error.message });
    }

    if (ultimosAtendimentosRes.error) {
      return res.status(500).json({ error: ultimosAtendimentosRes.error.message });
    }

    const agendamentos = agendamentosRes.data || [];
    const durations = agendamentos
      .map((item) => parseDurationToMinutes(item.duracao))
      .filter((value) => typeof value === 'number' && value > 0);
    const avgDuration = durations.length
      ? Math.round(durations.reduce((acc, curr) => acc + curr, 0) / durations.length)
      : 0;

    const statusBuckets = {
      resolved: 0,
      in_progress: 0,
      pending: 0,
      cancelled: 0,
    };

    agendamentos.forEach((item) => {
      const bucket = mapStatusBucket(item.status);
      statusBuckets[bucket] += 1;
    });

    const totalAgendamentos = agendamentos.length || 1; // evita divisão por zero
    const resolucaoPerc = Math.round((statusBuckets.resolved / totalAgendamentos) * 1000) / 10;
    const abandonoPerc = Math.round((statusBuckets.cancelled / totalAgendamentos) * 1000) / 10;

    const response = {
      period: {
        start: startDateISO,
        end: endDateISO,
        days,
      },
      kpis: {
        atendimentos: atendimentosCountRes.count || 0,
        mediaDuracaoMin: avgDuration,
        resolucaoPerc: Number.isFinite(resolucaoPerc) ? resolucaoPerc : 0,
        abandonoPerc: Number.isFinite(abandonoPerc) ? abandonoPerc : 0,
      },
      statusBuckets,
      ultimosAtendimentos: (ultimosAtendimentosRes.data || []).map((item) => ({
        data: item.data,
        hora: item.hora,
        pet: item.pet_nome,
        especie: item.especie,
        tutor: item.tutor_nome,
        servico: item.servico,
        status: item.status,
      })),
      ultimosCadastros: (ultimosClientesData || []).map((item) => ({
        codigo: item.codigo,
        nome: item.nome,
        telefone: item.telefone,
        pet: item.pets && item.pets.length ? item.pets[0].nome : null,
        especie: item.pets && item.pets.length ? item.pets[0].especie : null,
        created_at: item.created_at || null,
      })),
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
