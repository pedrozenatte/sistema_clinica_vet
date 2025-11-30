import { Router } from 'express';
import { supabase } from '../lib/supabaseClient.js';

const router = Router();

// Selecionamos sempre o mesmo conjunto para manter frontend e dashboard sincronizados.
const selectFields =
  'id,cliente_id,pet_id,data,hora,pet_nome,especie,tutor_nome,servico,veterinario,status,contato,destaque,observacoes,canal,duracao,tipo,prioridade';

const sanitizePattern = (value = '') => `%${value}%`.replace(/,/g, '');

router.get('/', async (req, res) => {
  const { status, q, dataDe, dataAte } = req.query;
  let query = supabase
    .from('agendamentos')
    .select(selectFields)
    .order('data', { ascending: true })
    .order('hora', { ascending: true });

  if (status) {
    query = query.eq('status', status);
  }

  if (dataDe) {
    query = query.gte('data', dataDe);
  }

  if (dataAte) {
    query = query.lte('data', dataAte);
  }

  if (q) {
    const pattern = sanitizePattern(q);
    query = query.or(
      `pet_nome.ilike.${pattern},tutor_nome.ilike.${pattern},servico.ilike.${pattern},veterinario.ilike.${pattern}`,
    );
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data || []);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('agendamentos').select(selectFields).eq('id', id).single();
  if (error) {
    return res.status(404).json({ error: `Agendamento ${id} não encontrado.` });
  }
  return res.json(data);
});

router.post('/', async (req, res) => {
  const payload = req.body;
  if (!payload.pet_nome || !payload.tutor_nome || !payload.data || !payload.hora) {
    return res.status(400).json({ error: 'Campos obrigatórios: pet_nome, tutor_nome, data, hora.' });
  }

  const { data, error } = await supabase
    .from('agendamentos')
    .insert(payload)
    .select(selectFields)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(data);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  
  // Remove campos que não devem ser atualizados diretamente ou que são PK
  delete payload.id;
  delete payload.created_at;

  const { data, error } = await supabase
    .from('agendamentos')
    .update(payload)
    .eq('id', id)
    .select(selectFields)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('agendamentos')
    .delete()
    .eq('id', id)
    .select('id')
    .single();

  if (error) {
    return res.status(404).json({ error: `Agendamento ${id} não encontrado.` });
  }

  res.json({ success: true, id: data.id });
});

export default router;
