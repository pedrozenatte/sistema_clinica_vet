import { supabase } from '../lib/supabaseClient.js';

const AUTH_COOKIE = 'sb_access_token';

// Decodifica o header Cookie em um map simples; evita libs externas para algo trivial.
const parseCookies = (cookieHeader = '') =>
  cookieHeader
    .split(';')
    .map((chunk) => chunk.trim().split('='))
    .reduce((acc, [key, ...rest]) => {
      if (!key) return acc;
      acc[key] = decodeURIComponent(rest.join('=') || '');
      return acc;
    }, {});

const getTokenFromRequest = (req) => {
  const auth = req.headers.authorization || '';
  if (auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  const cookies = parseCookies(req.headers.cookie || '');
  return cookies[AUTH_COOKIE] || null;
};

export const setSessionCookie = (res, session) => {
  if (!session?.access_token) return;
  const maxAge = session.expires_in ? session.expires_in * 1000 : 24 * 60 * 60 * 1000;
  res.cookie(AUTH_COOKIE, session.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
    path: '/',
  });
};

export const clearSessionCookie = (res) => {
  res.cookie(AUTH_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
  });
};

// Apenas anexa o usuário se houver token, permitindo páginas públicas consumirem res.locals.user.
export const attachUserIfPresent = async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) return next();
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data?.user) {
      req.user = data.user;
      res.locals.user = data.user;
    }
  } catch (err) {
    // ignora falhas silenciosamente para não quebrar fluxo público
  }
  return next();
};

export const requireAuth = async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }
  req.user = data.user;
  res.locals.user = data.user;
  return next();
};

const isPublicPath = (path = '') =>
  path.startsWith('/pages/login') ||
  path.startsWith('/assets') ||
  path.startsWith('/styles') ||
  path.startsWith('/scripts') ||
  path === '/favicon.ico' ||
  path === '/health' ||
  path.startsWith('/api/auth');

export const requirePageAuth = async (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (isPublicPath(req.path)) return next();
  if (!req.accepts('html')) return next();

  const token = getTokenFromRequest(req);
  if (!token) {
    const redirect = encodeURIComponent(req.originalUrl || '/');
    return res.redirect(`/pages/login.html?redirect=${redirect}`);
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    const redirect = encodeURIComponent(req.originalUrl || '/');
    return res.redirect(`/pages/login.html?redirect=${redirect}`);
  }

  req.user = data.user;
  res.locals.user = data.user;
  return next();
};
