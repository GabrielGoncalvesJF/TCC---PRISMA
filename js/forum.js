document.addEventListener('DOMContentLoaded', () => {
    const lista = document.querySelector('.forum-lista');
    const detalhe = document.getElementById('forum-detalhe');
    const btnToggle = document.getElementById('btn-toggle-post-form');
    const formNovoPost = document.getElementById('form-novo-post');
    const inputTitulo = document.getElementById('input-post-titulo');
    const inputCorpo = document.getElementById('input-post-corpo');
    const btnCriarPost = document.getElementById('btn-criar-post');
    const mensagem = document.getElementById('forum-mensagem');

    function getUsuario() {
        try {
            return JSON.parse(localStorage.getItem('usuarioToken') || 'null');
        } catch {
            return null;
        }
    }

    function formatarData(str) {
        return new Date(str).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    }

    async function listarPosts() {
        const res = await fetch('api/model/forum.php');
        return await res.json();
    }

    async function getPost(id) {
        const res = await fetch(`api/model/forum.php?id=${id}`);
        return await res.json();
    }

    async function criarPost(titulo, corpo) {
        const res = await fetch('api/model/forum.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, corpo })
        });
        return await res.json();
    }

    async function criarResposta(postId, corpo) {
        const res = await fetch('api/model/forum.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ acao: 'resposta', post_id: postId, corpo })
        });
        return await res.json();
    }

    function mostrarMensagem(texto, isError = false) {
        mensagem.textContent = texto;
        mensagem.className = isError ? 'text-danger small' : 'text-success small';
    }

    function criarPostCard(post) {
        return `
            <div class="card mb-3 forum-post-card" data-id="${post.id}" style="cursor:pointer;">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <h6 class="mb-1">${post.titulo}</h6>
                            <small class="text-muted">${post.autor_nome} • ${formatarData(post.criado_em)}</small>
                        </div>
                        <span class="badge bg-secondary">${post.total_respostas} respostas</span>
                    </div>
                </div>
            </div>
        `;
    }

    function renderLista(posts) {
        if (!lista) return;

        if (!posts || posts.length === 0) {
            lista.innerHTML = '<p class="text-muted">Ainda não há perguntas. Crie a primeira!</p>';
            return;
        }

        lista.innerHTML = posts.map(criarPostCard).join('');
        lista.querySelectorAll('.forum-post-card').forEach(card => {
            card.addEventListener('click', () => carregarDetalhes(parseInt(card.dataset.id, 10)));
        });
    }

    function renderDetalhes(post, usuario) {
        if (!detalhe) return;

        const respostasHtml = (post.respostas || []).map(r => `
            <div class="border rounded p-3 mb-2">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <strong>${r.autor_nome}</strong>
                        <div class="text-muted small">${formatarData(r.criado_em)}</div>
                    </div>
                    ${usuario && usuario.id === r.autor_id ? `<button class="btn btn-sm btn-outline-danger btn-deletar-resposta" data-id="${r.id}">Deletar</button>` : ''}
                </div>
                <p class="mb-0">${r.corpo}</p>
            </div>
        `).join('');

        detalhe.classList.remove('d-none');
        detalhe.innerHTML = `
            <h5>${post.titulo}</h5>
            <div class="text-muted small mb-3">${post.autor_nome} • ${formatarData(post.criado_em)}</div>
            <p>${post.corpo}</p>
            <hr>
            <h6>Respostas</h6>
            ${respostasHtml || '<p class="text-muted">Ainda não há respostas.</p>'}
            ${usuario ? `
                <div class="mt-3">
                    <textarea id="input-resposta" class="form-control mb-2" rows="3" placeholder="Escreva uma resposta..."></textarea>
                    <button id="btn-responder" class="btn btn-sm btn-primary">Responder</button>
                    <span id="mensagem-resposta" class="text-danger small d-block mt-2"></span>
                </div>
            ` : '<p class="text-muted small">Faça login para responder a esta pergunta.</p>'}
        `;

        if (usuario) {
            detalhe.querySelector('#btn-responder')?.addEventListener('click', async () => {
                const corpo = detalhe.querySelector('#input-resposta')?.value.trim();
                const mensagemResposta = detalhe.querySelector('#mensagem-resposta');

                if (!corpo) {
                    if (mensagemResposta) mensagemResposta.textContent = 'Escreva a resposta antes de enviar.';
                    return;
                }

                const data = await criarResposta(post.id, corpo);
                if (!data.sucesso) {
                    if (mensagemResposta) mensagemResposta.textContent = data.erros?.[0] || data.erro || 'Erro ao enviar resposta.';
                    return;
                }

                carregarDetalhes(post.id);
            });

            detalhe.querySelectorAll('.btn-deletar-resposta').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Remover esta resposta?')) return;
                    const id = parseInt(btn.dataset.id, 10);
                    const res = await fetch('api/model/forum.php', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ acao: 'resposta', id })
                    });
                    const data = await res.json();
                    if (data.sucesso) carregarDetalhes(post.id);
                    else alert(data.erro || 'Não foi possível remover a resposta.');
                });
            });
        }
    }

    async function carregarDetalhes(id) {
        if (!id) return;
        const data = await getPost(id);
        if (!data.sucesso) {
            lista.innerHTML = `<p class="text-danger">${data.erro || 'Erro ao carregar post.'}</p>`;
            return;
        }
        renderDetalhes(data.post, getUsuario());
    }

    async function carregarPosts() {
        const data = await listarPosts();
        if (!data.sucesso) {
            lista.innerHTML = `<p class="text-danger">${data.erro || 'Erro ao carregar posts.'}</p>`;
            return;
        }
        renderLista(data.posts);
    }

    async function init() {
        const usuario = getUsuario();
        if (!usuario) {
            btnToggle.textContent = 'Faça login para criar pergunta';
            btnToggle.disabled = true;
            formNovoPost.classList.add('d-none');
        } else {
            btnToggle.addEventListener('click', () => {
                formNovoPost.classList.toggle('d-none');
            });

            btnCriarPost.addEventListener('click', async (event) => {
                event.preventDefault();
                mostrarMensagem('', false);

                const titulo = inputTitulo.value.trim();
                const corpo = inputCorpo.value.trim();
                if (!titulo || !corpo) {
                    mostrarMensagem('Preencha título e descrição.', true);
                    return;
                }

                const data = await criarPost(titulo, corpo);
                if (!data.sucesso) {
                    mostrarMensagem(data.erros?.[0] || data.erro || 'Erro ao publicar pergunta.', true);
                    return;
                }

                mostrarMensagem('Pergunta publicada! Atualizando lista...', false);
                inputTitulo.value = '';
                inputCorpo.value = '';
                formNovoPost.classList.add('d-none');
                await carregarPosts();
            });
        }

        await carregarPosts();
    }

    init();
});
