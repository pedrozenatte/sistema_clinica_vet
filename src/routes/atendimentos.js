import { Router } from 'express';
import { supabase } from '../lib/supabaseClient.js';

const router = Router();
const selectFields =
  'id,agendamento_id,cliente_id,pet_id,tutor_nome,pet_nome,especie,veterinario,tipo,status,data,hora,anamnese,exame_obs,hipoteses,exames,prescricao,created_at';

const sanitizePattern = (value = '') => `%${value}%`.replace(/,/g, '');

// A prescrição pode vir como array, string JSON ou textarea; convertemos para array consistente.
const normalizePrescricao = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value.trim()];
    } catch (error) {
      return value
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
};

const preparePayload = (input = {}) => {
  const payload = { ...input };
  if (payload.prescricao !== undefined) {
    payload.prescricao = normalizePrescricao(payload.prescricao);
  }
  return payload;
};

router.get('/', async (req, res) => {
  const { status, q, dataDe, dataAte, agendamentoId } = req.query;
  let query = supabase
    .from('atendimentos')
    .select(selectFields)
    .order('data', { ascending: false })
    .order('hora', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (agendamentoId) {
    query = query.eq('agendamento_id', agendamentoId);
  }

  if (dataDe) {
    query = query.gte('data', dataDe);
  }

  if (dataAte) {
    query = query.lte('data', dataAte);
  }

  if (q) {
    const pattern = sanitizePattern(q);
    query = query.or(`pet_nome.ilike.${pattern},tutor_nome.ilike.${pattern},veterinario.ilike.${pattern}`);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data || []);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('atendimentos').select(selectFields).eq('id', id).single();
  if (error) {
    return res.status(404).json({ error: `Atendimento ${id} não encontrado.` });
  }
  return res.json(data);
});

router.post('/', async (req, res) => {
  const payload = preparePayload(req.body);
  if (!payload.tutor_nome || !payload.pet_nome || !payload.data || !payload.hora) {
    return res
      .status(400)
      .json({ error: 'Campos obrigatórios: tutor_nome, pet_nome, data, hora.' });
  }

  const { data, error } = await supabase
    .from('atendimentos')
    .insert(payload)
    .select(selectFields)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json(data);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const payload = preparePayload(req.body);
  delete payload.id;
  delete payload.created_at;

  const { data, error } = await supabase
    .from('atendimentos')
    .update(payload)
    .eq('id', id)
    .select(selectFields)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.json(data);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('atendimentos')
    .delete()
    .eq('id', id)
    .select('id')
    .single();

  if (error) {
    return res.status(404).json({ error: `Atendimento ${id} não encontrado.` });
  }

  return res.json({ success: true, id: data.id });
});

export default router;
