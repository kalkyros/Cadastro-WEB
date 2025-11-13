// Copiado de script.js original — máscaras e validações
// Função para aplicar a máscara do CPF
function mascaraCPF(cpf) {
  cpf = cpf.replace(/\D/g, ''); // Remove tudo o que não é dígito
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Coloca ponto entre o terceiro e o quarto dígitos
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Coloca ponto entre o sexto e o sétimo dígitos
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Coloca hífen entre o nono e o décimo dígitos
  return cpf;
}

// Função para aplicar a máscara do telefone
function mascaraTelefone(telefone) {
  telefone = telefone.replace(/\D/g, ''); // Remove tudo o que não é dígito
  if (telefone.length > 11) telefone = telefone.slice(0, 11); // Limita a 11 dígitos
  if (telefone.length > 2) {
    telefone = telefone.replace(/^(\d{2})(\d)/g, '($1) $2'); // Coloca parênteses em volta dos dois primeiros dígitos
  }
  if (telefone.length > 7) {
    telefone = telefone.replace(/(\d)(\d{4})$/, '$1-$2'); // Coloca hífen entre o quarto e o quinto dígitos
  }
  return telefone;
}

document.addEventListener('DOMContentLoaded', function() {
  const cpfInput = document.getElementById('cpf');
  const telefoneInput = document.getElementById('telefone');
  const nomeInput = document.getElementById('nome');
  const senhaInput = document.getElementById('senha');
  const confirmaSenhaInput = document.getElementById('confirma_senha');
  const mostrarSenhaCheckbox = document.getElementById('mostrar-senha');
  const senhaForca = document.querySelector('#senha-forca div');
  
  const cpfError = document.getElementById('cpf-error');
  const telefoneError = document.getElementById('telefone-error');
  const nomeError = document.getElementById('nome-error');
  const senhaError = document.getElementById('senha-error');
  const confirmaSenhaError = document.getElementById('confirma-senha-error');
  
  const form = document.getElementById('formCadastro');

  if (cpfInput) {
    // Aplica a máscara quando o usuário digita no CPF
    cpfInput.addEventListener('input', function(e) {
      let cpf = e.target.value;
      e.target.value = mascaraCPF(cpf);
    });
  }

  if (telefoneInput) {
    // Aplica a máscara quando o usuário digita no telefone
    telefoneInput.addEventListener('input', function(e) {
      let telefone = e.target.value;
      e.target.value = mascaraTelefone(telefone);
    });
  }

  if (nomeInput) {
    // Validação do nome
    nomeInput.addEventListener('input', function(e) {
      const nome = e.target.value;
      // Remove números assim que são digitados
      if (/\d/.test(nome)) {
        e.target.value = nome.replace(/\d/g, '');
      }
      // Valida o formato do nome
      if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nome) && nome !== '') {
        nomeError.style.display = 'block';
      } else {
        nomeError.style.display = 'none';
      }
    });
  }

  if (senhaInput) {
    // Validação da força da senha
    senhaInput.addEventListener('input', function(e) {
      const senha = e.target.value;
      const forca = verificarForcaSenha(senha);
      
      // Atualiza a barra de força
      if (senhaForca) {
        senhaForca.style.width = forca.porcentagem + '%';
        senhaForca.style.backgroundColor = forca.cor;
      }
      
      // Mostra/esconde mensagem de erro
      if (senha.length > 0 && !forca.valida) {
        senhaError.style.display = 'block';
      } else {
        senhaError.style.display = 'none';
      }
    });
  }

  if (confirmaSenhaInput) {
    // Validação de confirmação de senha
    confirmaSenhaInput.addEventListener('input', function(e) {
      if (senhaInput.value !== e.target.value) {
        confirmaSenhaError.style.display = 'block';
      } else {
        confirmaSenhaError.style.display = 'none';
      }
    });
  }

  if (mostrarSenhaCheckbox) {
    // Mostrar/ocultar senhas
    mostrarSenhaCheckbox.addEventListener('change', function() {
      const tipo = this.checked ? 'text' : 'password';
      if (senhaInput) senhaInput.type = tipo;
      if (confirmaSenhaInput) confirmaSenhaInput.type = tipo;
    });
  }

  if (form) {
    form.addEventListener('submit', function(e) {
      // Validações finais no submit (apenas se os campos existirem)
      let isValid = true;

      if (cpfInput) {
        const cpf = cpfInput.value.replace(/[^\d]+/g, '');
        if (!validarCPF(cpf)) {
          cpfError.style.display = 'block';
          isValid = false;
        } else {
          cpfError.style.display = 'none';
        }
      }

      if (telefoneInput) {
        const telefone = telefoneInput.value.replace(/[^\d]+/g, '');
        if (telefone.length < 10 || telefone.length > 11) {
          telefoneError.style.display = 'block';
          isValid = false;
        } else {
          telefoneError.style.display = 'none';
        }
      }

      if (nomeInput) {
        const nome = nomeInput.value;
        if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nome)) {
          nomeError.style.display = 'block';
          isValid = false;
        } else {
          nomeError.style.display = 'none';
        }
      }

      if (senhaInput) {
        const senha = senhaInput.value;
        const forcaSenha = verificarForcaSenha(senha);
        if (!forcaSenha.valida) {
          senhaError.style.display = 'block';
          isValid = false;
        } else {
          senhaError.style.display = 'none';
        }
      }

      if (confirmaSenhaInput) {
        if (senhaInput.value !== confirmaSenhaInput.value) {
          confirmaSenhaError.style.display = 'block';
          isValid = false;
        } else {
          confirmaSenhaError.style.display = 'none';
        }
      }

      if (!isValid) {
        e.preventDefault();
      }
    });
  }
});

function verificarForcaSenha(senha) {
  let pontos = 0;
  const regexes = {
    maiusculas: /[A-Z]/,
    minusculas: /[a-z]/,
    numeros: /[0-9]/,
    especiais: /[!@#$%^&*(),.?":{}|<>]/
  };

  // Verifica comprimento
  if (senha.length >= 8) pontos += 25;
  
  // Verifica caracteres especiais
  for (let tipo in regexes) {
    if (regexes[tipo].test(senha)) pontos += 25;
  }

  // Define a cor com base na pontuação
  let cor = '#ff4444'; // vermelho
  if (pontos >= 100) cor = '#44ff44'; // verde
  else if (pontos >= 75) cor = '#ffff44'; // amarelo
  else if (pontos >= 50) cor = '#ffa500'; // laranja

  return {
    valida: pontos >= 100,
    porcentagem: Math.min(100, pontos),
    cor: cor
  };
}

function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, ''); // remove pontos e traços
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0, resto;

  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}
