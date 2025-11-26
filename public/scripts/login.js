(() => {
  const form = document.getElementById('authForm');
  const btnSubmit = document.getElementById('btnSubmit');
  const btnToggle = document.getElementById('btnToggleMode');
  const title = document.getElementById('authTitle');
  const errorBox = document.getElementById('errorBox');

  let mode = 'login'; // 'login' | 'signup'

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect') || '/pages/dashboard.html';

  const setMode = (nextMode) => {
    mode = nextMode;
    title.textContent = mode === 'login' ? 'Acessar' : 'Criar conta';
    btnSubmit.textContent = mode === 'login' ? 'Entrar' : 'Registrar';
    btnToggle.textContent = mode === 'login' ? 'Criar conta' : 'Já tenho conta';
  };

  const showError = (message) => {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.hidden = !message;
  };

  const submit = async (event) => {
    event.preventDefault();
    showError('');

    const data = new FormData(form);
    const email = (data.get('email') || '').trim();
    const password = (data.get('password') || '').trim();

    if (!email || !password) {
      showError('Informe e-mail e senha.');
      return;
    }

    btnSubmit.setAttribute('disabled', 'disabled');
    btnSubmit.textContent = mode === 'login' ? 'Entrando...' : 'Criando...';

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(payload?.error || 'Falha ao autenticar.');
      }
      window.location.href = redirect;
    } catch (error) {
      showError(error.message);
    } finally {
      btnSubmit.removeAttribute('disabled');
      btnSubmit.textContent = mode === 'login' ? 'Entrar' : 'Registrar';
    }
  };

  btnToggle?.addEventListener('click', () => setMode(mode === 'login' ? 'signup' : 'login'));
  form?.addEventListener('submit', submit);
})();
