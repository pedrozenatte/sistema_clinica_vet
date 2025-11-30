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

// Envelopa chamadas ao Supabase para não quebrar o painel mesmo com colunas ausentes.
const safeQuery = async (promise, fallback = []) => {
  try {
    const { data, error, count } = await promise;
    if (error) {
      console.error('[dashboard] query failed:', error.message);
      return { data: Array.isArray(fallback) ? fallback : [], count: count ?? 0, error };
    }
    return { data: data ?? fallback, count: count ?? 0 };
  } catch (error) {
    console.error('[dashboard] query crashed:', error.message);
    return { data: Array.isArray(fallback) ? fallback : [], count: 0, error };
  }
};

const normalizeDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.slice(0, 10);
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }
  return null;
};

const normalizeTime = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    const match = value.match(/(\d{2}):(\d{2})/);
    if (match) return `${match[1]}:${match[2]}`;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(11, 16);
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
    const agendamentosPromise = safeQuery(
      supabase
        .from('agendamentos')
        .select('id,data,hora,pet_nome,especie,tutor_nome,servico,veterinario,status,contato,duracao')
        .gte('data', startDateISO)
        .lte('data', endDateISO),
    );
    const atendimentosPromise = safeQuery(
      supabase
        .from('atendimentos')
        .select('id,tipo,status')
        .gte('data', startDateISO)
        .lte('data', endDateISO),
    );
    const ultimosAtendimentosPromise = safeQuery(
      supabase
        .from('atendimentos')
        .select('data,hora,pet_nome,especie,tutor_nome,veterinario,tipo,status')
        .order('data', { ascending: false })
        .order('hora', { ascending: false })
        .limit(4),
    );
    const ultimosClientesPromise = safeQuery(
      supabase
        .from('clientes')
        .select('codigo,nome,telefone,created_at,pets ( nome, especie )')
        .order('created_at', { ascending: false, nullsFirst: false })
        .limit(4),
    );

    const [agendamentosRes, atendimentosRes, ultimosAtendimentosRes, ultimosClientesRes] =
      await Promise.all([agendamentosPromise, atendimentosPromise, ultimosAtendimentosPromise, ultimosClientesPromise]);

    const agendamentosData = agendamentosRes.data || [];
    const atendimentosData = atendimentosRes.data || [];
    const ultimosAtendimentosData = ultimosAtendimentosRes.data || [];

    // Fallback para clientes caso created_at não exista
    let ultimosClientesData = ultimosClientesRes.data || [];
    if ((ultimosClientesRes.error && /created_at/.test(ultimosClientesRes.error.message)) || !ultimosClientesData.length) {
      const fallback = await safeQuery(
        supabase
          .from('clientes')
          .select('codigo,nome,telefone,pets ( nome, especie )')
          .order('codigo', { ascending: false })
          .limit(4),
      );
      const fallbackData = fallback.data || [];
      if (fallbackData.length) {
        ultimosClientesData = fallbackData;
      }
    }

    const agendamentos = agendamentosData;
    const durations = agendamentos
      .map((item) => parseDurationToMinutes(item.duracao))
      .filter((value) => typeof value === 'number' && value > 0);
    const avgDuration = durations.length
      ? Math.round(durations.reduce((acc, curr) => acc + curr, 0) / durations.length)
      : 0;

    const statusBuckets = { resolved: 0, in_progress: 0, pending: 0, cancelled: 0 };
    atendimentosData.forEach((item) => {
      const bucket = mapStatusBucket(item.status);
      statusBuckets[bucket] += 1;
    });
    const totalAtendimentos = atendimentosData.length || 1;
    const resolucaoPerc = Math.round((statusBuckets.resolved / totalAtendimentos) * 1000) / 10;
    const abandonoPerc = Math.round((statusBuckets.cancelled / totalAtendimentos) * 1000) / 10;

    const response = {
      period: {
        start: startDateISO,
        end: endDateISO,
        days,
      },
      kpis: {
        atendimentos: atendimentosData.length,
        mediaDuracaoMin: avgDuration,
        resolucaoPerc: Number.isFinite(resolucaoPerc) ? resolucaoPerc : 0,
        abandonoPerc: Number.isFinite(abandonoPerc) ? abandonoPerc : 0,
      },
      statusBuckets,
      ultimosAtendimentos: (ultimosAtendimentosData || []).map((item) => ({
        data: normalizeDate(item.data),
        hora: normalizeTime(item.hora),
        pet: item.pet_nome,
        especie: item.especie,
        tutor: item.tutor_nome,
        servico: item.tipo || item.veterinario || 'Atendimento',
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
