// ------------------------------------------------------------
// AUTENTICAÇÃO
// ------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const cadNome = document.getElementById('nome');
    const cadEmail = document.getElementById('email');
    const cadSenha = document.getElementById('senha');
    const cadSenhaConfirma = document.getElementById('senhaConfirma');
    const cadTipo = document.getElementById('tipo');

async function cadastrar(nome, email, senha, senhaConfirma, tipo = 'aluno') {
    const res = await fetch('api/model/cadastro.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, senha_confirma: senhaConfirma, tipo })
    });
    return await res.json();
}

const btnCadastrar = document.querySelector('.btn.cadastrar');
btnCadastrar?.addEventListener('click', async () => {
    const nome = cadNome.value.trim();
    const email = cadEmail.value.trim();
    const senha = cadSenha.value;
    const senhaConfirma = cadSenhaConfirma.value;
    const tipo = cadTipo?.value || 'aluno';

    const dados = await cadastrar(nome, email, senha, senhaConfirma, tipo);

    if (!dados.sucesso) {
        alert(dados.erros?.[0] || dados.erro || 'Erro no cadastro');
        return;
    }

    alert(dados.mensagem || 'Cadastro realizado!');

    // Se ao cadastrar a API já autenticar o usuário, então faz o login automático
    // e redireciona para a tela correta (igual ao fluxo do login.js).
    try {
        const senhaLogin = senha;

        // tenta extrair usuário retornado pelo cadastro
        const usuario = dados.usuario || dados.user || dados.resultado?.usuario;
        const emailLogin = usuario?.email || usuario?.email_usuario || email;

        if (emailLogin && senhaLogin) {
            const loginRes = await fetch('api/model/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailLogin, senha: senhaLogin })
            }).then(r => r.json());

            if (loginRes?.sucesso) {
                const tipo = loginRes?.usuario?.tipo;
                if (tipo === 'professor') window.location.href = 'material_prof.html';
                else window.location.href = 'perfil.html';
                return;
            }
        }
    } catch (e) {
        // ignora e usa fallback
    }

    // fallback
    window.location.href = 'index.html';
});

});


