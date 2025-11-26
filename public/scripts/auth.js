(() => {
  const loginPath = '/pages/login.html';
  const hereIsLogin = window.location.pathname.endsWith('/login.html');

  const redirectToLogin = () => {
    const current = `${window.location.pathname}${window.location.search}`;
    const redirect = encodeURIComponent(current || '/');
    window.location.href = `${loginPath}?redirect=${redirect}`;
  };

  const checkSession = async () => {
    try {
      const resp = await fetch('/api/auth/me');
      if (!resp.ok) throw new Error('unauthorized');
      const data = await resp.json();
      window.currentUser = data.user;
    } catch (err) {
      if (!hereIsLogin) {
        redirectToLogin();
      }
    }
  };

  window.logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      redirectToLogin();
    }
  };

  if (!hereIsLogin) {
    checkSession();
  }
})();
