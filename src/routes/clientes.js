import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { supabase } from '../lib/supabaseClient.js';

const router = Router();
const baseSelect = 'id,codigo,nome,cpf,email,telefone,situacao,pets ( id,nome,especie )';
const generateCodigo = () => `CLI-${randomUUID().split('-')[0].toUpperCase()}`;

const sanitizePattern = (value = '') => `%${value}%`.replace(/,/g, '');

router.get('/', async (req, res) => {
  const { situacao, q } = req.query;
  let query = supabase.from('clientes').select(baseSelect).order('nome');

  if (situacao) {
    query = query.eq('situacao', situacao);
  }

  if (q) {
    const pattern = sanitizePattern(q);
    query = query.or(
      `nome.ilike.${pattern},cpf.ilike.${pattern},email.ilike.${pattern},cidade.ilike.${pattern},uf.ilike.${pattern}`,
    );
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data || []);
});

router.get('/:codigo', async (req, res) => {
  const { codigo } = req.params;
  const { data, error } = await supabase
    .from('clientes')
    .select(baseSelect)
    .eq('codigo', codigo)
    .single();

  if (error) {
    return res.status(404).json({ error: `Cliente ${codigo} não encontrado.` });
  }

  res.json(data);
});

router.post('/', async (req, res) => {
  const { pet, ...cliente } = req.body;
  if (!cliente.nome) {
    return res.status(400).json({ error: 'Campo "nome" é obrigatório.' });
  }

  const codigo = (cliente.codigo || '').trim() || generateCodigo();

  const { data, error } = await supabase
    .from('clientes')
    .insert({ ...cliente, codigo })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (pet && pet.nome) {
    await supabase.from('pets').insert({ ...pet, cliente_id: data.id });
  }

  const { data: full, error: fetchError } = await supabase
    .from('clientes')
    .select(baseSelect)
    .eq('id', data.id)
    .single();

  if (fetchError) {
    return res.status(201).json(data);
  }

  res.status(201).json(full);
});

router.delete('/:codigo', async (req, res) => {
  const { codigo } = req.params;
  const { data, error } = await supabase
    .from('clientes')
    .delete()
    .eq('codigo', codigo)
    .select('id')
    .single();

  if (error) {
    return res.status(404).json({ error: `Cliente ${codigo} não encontrado.` });
  }

  res.json({ success: true, id: data.id });
});

export default router;
