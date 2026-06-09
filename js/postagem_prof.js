document.addEventListener('DOMContentLoaded', () => {
    const formConteudo = document.getElementById('form-conteudo');
    const inputTitulo = document.getElementById('input-titulo');
    const inputTipo = document.getElementById('input-tipo');
    const inputCorpo = document.getElementById('input-corpo');
    const mensagem = document.getElementById('mensagem-postagem');
    const authBtn = document.getElementById('auth-button');

    function getUsuario() {
        try {
            return JSON.parse(localStorage.getItem('usuarioToken') || 'null');
        } catch {
            return null;
        }
    }

    async function criarConteudo(titulo, corpo, tipo) {
        const res = await fetch('api/model/conteudos.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, corpo, tipo })
        });
        return await res.json();
    }

    function mostrarMensagem(texto, isError = false) {
        mensagem.textContent = texto;
        mensagem.className = isError ? 'text-danger small' : 'text-success small';
    }

    function renderResumoPostagem(id, titulo, tipo) {
        const resumo = document.getElementById('resumo-postagem');
        if (!resumo) return;

        resumo.innerHTML = `
            <div class="card border-success shadow-sm">
                <div class="card-body">
                    <h5 class="card-title mb-2">Postagem criada</h5>
                    <p class="mb-1"><strong>Título:</strong> ${titulo}</p>
                    <p class="mb-1"><strong>Tipo:</strong> ${tipo === 'aula' ? 'Aula' : 'Postagem'}</p>
                    <p class="mb-0 text-muted">O conteúdo será exibido em <a href="material_prof.html">Meus Conteúdos</a>.</p>
                </div>
            </div>
        `;
    }

    async function init() {
        const usuario = getUsuario();
        if (!usuario || usuario.tipo !== 'professor') {
            window.location.href = 'login.html';
            return;
        }

        if (authBtn) {
            authBtn.textContent = usuario.nome;
            authBtn.href = 'perfil.html';
        }

        formConteudo.addEventListener('submit', async (event) => {
            event.preventDefault();
            mostrarMensagem('Criando conteúdo...', false);

            const titulo = inputTitulo.value.trim();
            const tipo = inputTipo.value;
            const corpo = inputCorpo.value.trim();

            if (!titulo || !corpo) {
                mostrarMensagem('Preencha título e conteúdo.', true);
                return;
            }

            try {
                const data = await criarConteudo(titulo, corpo, tipo);
                if (!data.sucesso) {
                    mostrarMensagem(data.erros?.[0] || data.erro || 'Erro ao criar conteúdo.', true);
                    return;
                }

                mostrarMensagem('Conteúdo criado com sucesso!', false);
                renderResumoPostagem(data.id, titulo, tipo);
                inputTitulo.value = '';
                inputCorpo.value = '';
                inputTipo.value = 'aula';
                setTimeout(() => {
                    window.location.href = 'material_prof.html';
                }, 1800);
            } catch (error) {
                console.error(error);
                mostrarMensagem('Erro na conexão. Tente novamente.', true);
            }
        });
    }

    init();
});
