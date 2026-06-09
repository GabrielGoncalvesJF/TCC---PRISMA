// ------------------------------------------------------------
// AUTENTICAÇÃO
// ------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const cadNome = document.getElementById('nome');
    const cadEmail = document.getElementById('email');
    const cadSenha = document.getElementById('senha');
    const cadSenhaConfirma = document.getElementById('senhaConfirma');
    const cadTipo = document.getElementById('tipo');
    const btnCadastrar = document.querySelector('.btn.cadastrar');

    async function cadastrar(nome, email, senha, senhaConfirma, tipo = 'aluno') {
        const res = await fetch('api/model/cadastro.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha, senha_confirma: senhaConfirma, tipo })
        });
        return await res.json();
    }

    btnCadastrar?.addEventListener('click', async () => {
        const nome = cadNome.value.trim();
        const email = cadEmail.value.trim();
        const senha = cadSenha.value;
        const senhaConfirma = cadSenhaConfirma.value;
        const tipo = cadTipo?.value || 'aluno';

        if (!nome || !email || !senha || !senhaConfirma) {
            alert('Preencha todos os campos para continuar.');
            return;
        }

        btnCadastrar.disabled = true;
        const originalText = btnCadastrar.textContent;
        btnCadastrar.textContent = 'Cadastrando...';

        try {
            const dados = await cadastrar(nome, email, senha, senhaConfirma, tipo);
            if (!dados.sucesso) {
                alert(dados.erros?.[0] || dados.erro || 'Erro no cadastro');
                return;
            }

            alert(dados.mensagem || 'Cadastro realizado com sucesso! Agora faça login.');
            window.location.href = 'login.html';
        } catch (error) {
            console.error(error);
            alert('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        } finally {
            btnCadastrar.disabled = false;
            btnCadastrar.textContent = originalText;
        }
    });
});


