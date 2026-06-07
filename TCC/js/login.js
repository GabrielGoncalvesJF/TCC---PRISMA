// ------------------------------------------------------------
// AUTENTICAÇÃO
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const logEmail = document.getElementById('email');
    const logSenha = document.getElementById('senha');

async function logar(email, senha) {
    const res = await fetch('api/model/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });
    return await res.json();
}

const btnLogar = document.querySelector('.btn.logar');
btnLogar?.addEventListener('click', async () => {
    const email = logEmail.value.trim();
    const senha = logSenha.value;

    const dados = await logar(email, senha);

    if (!dados.sucesso) {
        alert(dados.erros?.[0] || dados.erro || 'Erro no login');
        return;
    }

    // Redireciona com base no tipo retornado
    const tipo = dados.usuario?.tipo;
    if (tipo === 'professor') window.location.href = 'material_prof.html';
    else window.location.href = 'perfil.html';
});

});

