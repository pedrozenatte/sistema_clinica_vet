import { Router } from 'express';
import { supabase } from '../lib/supabaseClient.js';
import { clearSessionCookie, setSessionCookie } from '../middlewares/auth.js';

const router = Router();

const parseCookies = (cookieHeader = '') =>
  cookieHeader
    .split(';')
    .map((chunk) => chunk.trim().split('='))
    .reduce((acc, [key, ...rest]) => {
      if (!key) return acc;
      acc[key] = decodeURIComponent(rest.join('=') || '');
      return acc;
    }, {});

router.post('/signup', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Informe email e senha.' });
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  if (data.session) {
    setSessionCookie(res, data.session);
  }
  return res.status(201).json({ user: data.user, session: Boolean(data.session) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Informe email e senha.' });
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return res.status(401).json({ error: error.message });
  }
  setSessionCookie(res, data.session);
  return res.json({ user: data.user });
});

router.post('/logout', async (_req, res) => {
  clearSessionCookie(res);
  res.json({ success: true });
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  let token = null;
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.slice(7).trim();
  }
  if (!token) {
    const cookies = parseCookies(req.headers.cookie || '');
    token = cookies.sb_access_token || null;
  }
  if (!token) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }
  return res.json({ user: data.user });
});

export default router;
