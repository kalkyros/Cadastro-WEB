// Função para aplicar a máscara do CPF
function mascaraCPF(cpf) {
  cpf = cpf.replace(/\D/g, ''); // Remove tudo o que não é dígito
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Coloca ponto entre o terceiro e o quarto dígitos
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Coloca ponto entre o sexto e o sétimo dígitos
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Coloca hífen entre o nono e o décimo dígitos
  return cpf;
}

// Quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  const cpfInput = document.getElementById('cpf');
  const cpfError = document.getElementById('cpf-error');
  const form = document.getElementById('formCadastro');

  // Aplica a máscara quando o usuário digita
  cpfInput.addEventListener('input', function(e) {
    let cpf = e.target.value;
    e.target.value = mascaraCPF(cpf);
  });

  // Valida o CPF quando o formulário é enviado
  form.addEventListener('submit', function(e) {
    const cpf = cpfInput.value.replace(/[^\d]+/g, '');
    if (!validarCPF(cpf)) {
      e.preventDefault();
      cpfError.style.display = 'block';
    } else {
      cpfError.style.display = 'none';
    }
  });
});

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