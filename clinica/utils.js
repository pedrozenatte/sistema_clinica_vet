// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Faz requisição à API
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.erro || `Erro ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

/**
 * Exibe notificação ao usuário
 */
function mostrarNotificacao(mensagem, tipo = 'sucesso') {
  // Remove notificação anterior se existir
  const notificacaoAnterior = document.querySelector('.notificacao');
  if (notificacaoAnterior) {
    notificacaoAnterior.remove();
  }

  const notificacao = document.createElement('div');
  notificacao.className = `notificacao notificacao-${tipo}`;
  notificacao.textContent = mensagem;
  notificacao.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: ${tipo === 'sucesso' ? '#4caf50' : tipo === 'erro' ? '#f44336' : '#2196f3'};
    color: white;
    padding: 15px 20px;
    border-radius: 4px;
    z-index: 9999;
    animation: slideIn 0.3s ease-in-out;
  `;

  document.body.appendChild(notificacao);

  setTimeout(() => {
    notificacao.style.animation = 'slideOut 0.3s ease-in-out';
    setTimeout(() => notificacao.remove(), 300);
  }, 3000);
}

/**
 * Formata data para exibição
 */
function formatarData(data) {
  if (!data) return '';
  const d = new Date(data);
  return d.toLocaleDateString('pt-BR');
}

/**
 * Formata data e hora para exibição
 */
function formatarDataHora(data) {
  if (!data) return '';
  const d = new Date(data);
  return d.toLocaleString('pt-BR');
}

/**
 * Formata hora para exibição
 */
function formatarHora(hora) {
  if (!hora) return '';
  const [h, m] = hora.split(':');
  return `${h}:${m}`;
}

/**
 * Mascara CPF/CNPJ
 */
function mascaraCPFCNPJ(valor) {
  valor = valor.replace(/\D/g, '');
  if (valor.length <= 11) {
    return valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else {
    return valor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
}

/**
 * Mascara telefone
 */
function mascaraTelefone(valor) {
  valor = valor.replace(/\D/g, '');
  if (valor.length <= 10) {
    return valor.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    return valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
}

/**
 * Mascara CEP
 */
function mascaraCEP(valor) {
  valor = valor.replace(/\D/g, '');
  return valor.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Limpa formulário
 */
function limparFormulario(form) {
  if (form) {
    form.reset();
    form.querySelectorAll('input[type="hidden"]').forEach(input => input.remove());
  }
}

/**
 * Preenche formulário com dados
 */
function preencherFormulario(form, dados) {
  Object.keys(dados).forEach(chave => {
    const campo = form.querySelector(`[name="${chave}"]`);
    if (campo) {
      if (campo.type === 'checkbox') {
        campo.checked = dados[chave];
      } else {
        campo.value = dados[chave] || '';
      }
    }
  });
}

/**
 * Obtém dados do formulário como objeto
 */
function obterDadosFormulario(form) {
  const formData = new FormData(form);
  const dados = {};

  formData.forEach((valor, chave) => {
    if (dados[chave]) {
      if (Array.isArray(dados[chave])) {
        dados[chave].push(valor);
      } else {
        dados[chave] = [dados[chave], valor];
      }
    } else {
      dados[chave] = valor;
    }
  });

  return dados;
}

// CSS para animação de notificação
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
