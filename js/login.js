// ------------------------------------------------------------
// AUTENTICAÇÃO
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const logEmail = document.getElementById('email');
    const logSenha = document.getElementById('senha');
    const btnLogar = document.querySelector('.btn.logar');

    async function logar(email, senha) {
        const res = await fetch('api/model/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        return await res.json();
    }

    btnLogar?.addEventListener('click', async () => {
        const email = logEmail.value.trim();
        const senha = logSenha.value;

        if (!email || !senha) {
            alert('Preencha e-mail e senha para continuar.');
            return;
        }

        btnLogar.disabled = true;
        const originalText = btnLogar.textContent;
        btnLogar.textContent = 'Entrando...';

        try {
            const dados = await logar(email, senha);
            if (!dados.sucesso) {
                alert(dados.erros?.[0] || dados.erro || 'Erro no login');
                return;
            }

            localStorage.setItem('usuarioToken', JSON.stringify(dados.usuario));
            const tipo = dados.usuario?.tipo;
            if (tipo === 'professor') {
                window.location.href = 'material_prof.html';
            } else {
                window.location.href = 'perfil.html';
            }
        } catch (error) {
            console.error(error);
            alert('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        } finally {
            btnLogar.disabled = false;
            btnLogar.textContent = originalText;
        }
    });
});

