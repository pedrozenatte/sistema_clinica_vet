import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { supabase } from '../lib/supabaseClient.js';

const router = Router();
const baseSelect = '*,pets ( * )';
const generateCodigo = () => `CLI-${randomUUID().split('-')[0].toUpperCase()}`;

const sanitizePattern = (value = '') => `%${value}%`.replace(/,/g, '');

const normalizeNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  const parsed = Number.parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};
const pickClienteColumns = (input = {}) => {
  const allowed = [
    'codigo',
    'nome',
    'cpf',
    'email',
    'telefone',
    'situacao',
    'rua',
    'numero',
    'complemento',
    'bairro',
    'cep',
    'cidade',
    'estado',
    'pais',
  ];
  return allowed.reduce((acc, key) => {
    if (input[key] !== undefined && input[key] !== null) {
      acc[key] = input[key];
    }
    return acc;
  }, {});
};

const pickPetColumns = (input = {}) => {
  const allowed = ['nome', 'especie', 'raca', 'data_nascimento', 'sexo', 'peso', 'observacoes'];
  return allowed.reduce((acc, key) => {
    const value = input[key];
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const normalizePets = (input) => {
  if (!Array.isArray(input)) return [];
  return input
    .map((pet) => ({
      nome: (pet?.nome || '').trim(),
      especie: (pet?.especie || '').trim(),
      raca: (pet?.raca || '').trim(),
      data_nascimento: (pet?.data_nascimento || pet?.nascimento || '').trim(),
      sexo: (pet?.sexo || '').trim(),
      peso: normalizeNumber(pet?.peso ?? pet?.peso_kg ?? null),
      observacoes: (pet?.observacoes || '').trim(),
    }))
    .filter((pet) => pet.nome);
};

router.get('/', async (req, res) => {
  const { situacao, q } = req.query;
  let query = supabase.from('clientes').select(baseSelect).order('nome');

  if (situacao) {
    query = query.eq('situacao', situacao);
  }

  if (q) {
    const pattern = sanitizePattern(q);
    query = query.or(`nome.ilike.${pattern},cpf.ilike.${pattern},email.ilike.${pattern},cidade.ilike.${pattern}`);
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
  const { pet, pets, estado, ...cliente } = req.body;
  if (!cliente.nome) {
    return res.status(400).json({ error: 'Campo "nome" é obrigatório.' });
  }

  const codigo = (cliente.codigo || '').trim() || generateCodigo();
  const petsPayload = normalizePets(pets || (pet ? [pet] : []));
  const payload = pickClienteColumns({ ...cliente, codigo, estado });

  const { data, error } = await supabase
    .from('clientes')
    .insert(payload)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (petsPayload.length) {
    const { error: petsError } = await supabase
      .from('pets')
      .insert(petsPayload.map((p) => ({ ...pickPetColumns(p), cliente_id: data.id })));
    if (petsError) {
      return res.status(400).json({ error: petsError.message });
    }
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

router.put('/:codigo', async (req, res) => {
  const { codigo } = req.params;
  const { pet, pets, estado, ...cliente } = req.body;

  if (!cliente.nome) {
    return res.status(400).json({ error: 'Campo "nome" é obrigatório.' });
  }

  const petsPayload = normalizePets(pets || (pet ? [pet] : []));
  const payload = pickClienteColumns({ ...cliente, estado });

  const { data: existing, error: findError } = await supabase
    .from('clientes')
    .select('id')
    .eq('codigo', codigo)
    .single();

  if (findError || !existing) {
    return res.status(404).json({ error: `Cliente ${codigo} não encontrado.` });
  }

  const { data: updated, error: updateError } = await supabase
    .from('clientes')
    .update(payload)
    .eq('codigo', codigo)
    .select()
    .single();

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  if (petsPayload.length) {
    await supabase.from('pets').delete().eq('cliente_id', existing.id);
    const { error: petsError } = await supabase
      .from('pets')
      .insert(petsPayload.map((p) => ({ ...pickPetColumns(p), cliente_id: existing.id })));
    if (petsError) {
      return res.status(400).json({ error: petsError.message });
    }
  }

  const { data: full, error: fetchError } = await supabase
    .from('clientes')
    .select(baseSelect)
    .eq('id', existing.id)
    .single();

  if (fetchError) {
    return res.json(updated);
  }

  res.json(full);
});

router.post('/:codigo/pets', async (req, res) => {
  const { codigo } = req.params;
  const { nome, especie, raca, data_nascimento, sexo, peso, nascimento, observacoes } = req.body || {};

  if (!nome || !especie) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome, especie.' });
  }

  const { data: cliente, error: findError } = await supabase
    .from('clientes')
    .select('id,codigo')
    .eq('codigo', codigo)
    .single();

  if (findError || !cliente) {
    return res.status(404).json({ error: `Cliente ${codigo} não encontrado.` });
  }

  const payload = { nome, especie, cliente_id: cliente.id };
  if (raca) payload.raca = raca;
  const birth = data_nascimento || nascimento;
  if (birth) payload.data_nascimento = birth;
  if (sexo) payload.sexo = sexo;
  const pesoValue = normalizeNumber(peso);
  if (pesoValue !== null) payload.peso = pesoValue;
  if (observacoes) payload.observacoes = observacoes;

  const { data, error } = await supabase
    .from('pets')
    .insert(payload)
    .select('id,nome,especie,raca,data_nascimento,sexo,peso,observacoes,cliente_id')
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(data);
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
