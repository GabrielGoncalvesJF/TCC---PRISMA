// ------------------------------------------------------------
// MATERIAIS DO PROFESSOR
// ------------------------------------------------------------

async function listarMateriais(conteudoId) {
    const res = await fetch(`api/model/materiais.php?conteudo_id=${conteudoId}`);
    return await res.json();
}
// Exemplo de uso:
// const data = await listarMateriais(1);
// data.materiais.forEach(m => console.log(m.nome, m.url));


async function adicionarMaterial(conteudoId, nome, url, arquivo = null) {
    if (arquivo) {
        const form = new FormData();
        form.append('conteudo_id', conteudoId);
        form.append('nome', nome);
        form.append('arquivo', arquivo);
        if (url) form.append('url', url);

        const res = await fetch('api/model/materiais.php', {
            method: 'POST',
            body: form
        });
        return await res.json();
    }

    const res = await fetch('api/model/materiais.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudo_id: conteudoId, nome, url })
    });
    return await res.json();
}
// Exemplo de uso:
// const data = await adicionarMaterial(1, 'Slides da Aula', 'https://drive.google.com/...');


async function removerMaterial(id) {
    const res = await fetch('api/model/materiais.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    return await res.json();
}

async function removerConteudo(id) {
    const res = await fetch('api/model/conteudos.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    return await res.json();
}
// Exemplo de uso:
// const data = await removerConteudo(5);

// ------------------------------------------------------------
// PÁGINA — material_prof.html
// ------------------------------------------------------------

function getUsuario() {
    try { return JSON.parse(localStorage.getItem('usuarioToken')); }
    catch { return null; }
}

async function listarConteudos(tipo = null) {
    const url = tipo ? `api/model/conteudos.php?tipo=${tipo}` : 'api/model/conteudos.php';
    const res = await fetch(url);
    return await res.json();
}

function formatarData(str) {
    return new Date(str).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
}

function isImageUrl(url) {
    return /\.(jpe?g|png|gif|webp|svg)$/i.test(url.split('?')[0].split('#')[0]);
}

function abrirVisualizador(url, nome) {
    const overlay = document.getElementById('viewer-overlay');
    const img = document.getElementById('viewer-image');
    const caption = document.getElementById('viewer-caption');

    if (!overlay || !img) return;
    img.src = url;
    caption.textContent = nome || 'Imagem';
    overlay.classList.add('show');
}

function fecharVisualizador() {
    const overlay = document.getElementById('viewer-overlay');
    const img = document.getElementById('viewer-image');

    if (!overlay || !img) return;
    overlay.classList.remove('show');
    img.src = '';
}

function renderizarMateriais(materiais, conteudoId) {
    const lista = document.getElementById(`materiais-${conteudoId}`);
    if (!lista) return;

    if (!materiais.length) {
        lista.innerHTML = '<p class="text-muted small mb-0">Nenhum material ainda.</p>';
        return;
    }

    lista.innerHTML = materiais.map(m => `
        <div class="mb-2" id="material-${m.id}">
            <div class="d-flex align-items-center gap-2">
                <i class="material-icons text-info" style="font-size:18px;">link</i>
                ${isImageUrl(m.url)
                    ? `<button type="button" class="btn btn-link p-0 text-start small flex-grow-1 btn-preview-material" data-url="${m.url}" data-nome="${m.nome}">${m.nome}</button>`
                    : `<a href="${m.url}" target="_blank" class="text-decoration-none small flex-grow-1">${m.nome}</a>`
                }
                <button type="button" class="btn btn-sm text-danger p-0 btn-remover-material" data-id="${m.id}" title="Remover">
                    <i class="material-icons" style="font-size:16px;">delete</i>
                </button>
            </div>
            <div class="confirm-remocao mt-2 d-none" id="confirm-remover-${m.id}">
                <div class="d-flex align-items-center gap-2">
                    <span class="small text-danger">Deseja excluir esse material?</span>
                    <button type="button" class="btn btn-sm btn-outline-danger btn-confirm-remover" data-id="${m.id}">Sim</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary btn-cancel-remover" data-id="${m.id}">Não</button>
                </div>
                <span class="text-danger small d-none erro-remocao-${m.id}"></span>
            </div>
        </div>
    `).join('');

    lista.querySelectorAll('.btn-remover-material').forEach(btn => {
        const item = document.getElementById(`material-${btn.dataset.id}`);
        const confirmBox = item?.querySelector('.confirm-remocao');
        const btnConfirm = item?.querySelector('.btn-confirm-remover');
        const btnCancel = item?.querySelector('.btn-cancel-remover');
        const erroSpan = item?.querySelector(`.erro-remocao-${btn.dataset.id}`);

        btn.addEventListener('click', () => {
            confirmBox?.classList.remove('d-none');
            erroSpan?.classList.add('d-none');
        });

        btnCancel?.addEventListener('click', () => {
            confirmBox?.classList.add('d-none');
        });

        btnConfirm?.addEventListener('click', async () => {
            if (!item) return;
            const data = await removerMaterial(parseInt(btn.dataset.id));
            if (data.sucesso) {
                item.remove();
                if (!lista.children.length) {
                    lista.innerHTML = '<p class="text-muted small mb-0">Nenhum material ainda.</p>';
                }
            } else {
                if (erroSpan) {
                    erroSpan.textContent = data.erro ?? 'Erro ao remover material.';
                    erroSpan.classList.remove('d-none');
                }
            }
        });
    });

    lista.querySelectorAll('.btn-preview-material').forEach(btn => {
        btn.addEventListener('click', () => {
            abrirVisualizador(btn.dataset.url, btn.dataset.nome);
        });
    });
}

function criarCardConteudo(conteudo) {
    const div = document.createElement('div');
    div.className = 'mb-2';
    div.innerHTML = `
        <details class="card shadow-sm">
            <summary class="card-header d-flex align-items-center justify-content-between py-3 px-4">
                <div class="content-summary">
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-info text-dark">${conteudo.tipo === 'aula' ? 'Aula' : 'Postagem'}</span>
                        <strong>${conteudo.titulo}</strong>
                    </div>
                    <div class="text-muted small mt-1">${formatarData(conteudo.criado_em)}</div>
                </div>
                <i class="material-icons text-secondary">expand_more</i>
            </summary>
            <div class="card-body">
                <p class="mb-3 text-truncate" style="max-height: 4.5rem;">${conteudo.corpo}</p>
                <div id="materiais-${conteudo.id}" class="mb-3"></div>
                <div class="d-flex gap-2 flex-column flex-md-row mb-2">
                    <input type="text" class="form-control form-control-sm input-nome-material"
                        placeholder="Nome do material" data-conteudo="${conteudo.id}">
                    <input type="url" class="form-control form-control-sm input-url-material"
                        placeholder="https://..." data-conteudo="${conteudo.id}">
                    <button class="btn btn-sm btn-primary btn-add-material text-nowrap" data-conteudo="${conteudo.id}">
                        <i class="material-icons" style="font-size:16px;vertical-align:middle;">add</i> Adicionar
                    </button>
                </div>
                <div class="mb-2">
                    <input type="file" class="form-control form-control-sm input-file-material"
                        accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx" data-conteudo="${conteudo.id}">
                    <small class="text-muted">Ou envie um arquivo.</small>
                </div>
                <div class="mt-3 d-flex align-items-center gap-2">
                    <button type="button" class="btn btn-sm btn-outline-danger btn-delete-conteudo" data-id="${conteudo.id}">
                        <i class="material-icons" style="font-size:16px;vertical-align:middle;">delete</i> Excluir postagem
                    </button>
                </div>
                <div class="confirm-remocao-conteudo mt-2 d-none" id="confirm-conteudo-${conteudo.id}">
                    <div class="d-flex align-items-center gap-2">
                        <span class="small text-danger">Deseja excluir essa postagem?</span>
                        <button type="button" class="btn btn-sm btn-danger btn-confirm-delete-conteudo" data-id="${conteudo.id}">Sim</button>
                        <button type="button" class="btn btn-sm btn-secondary btn-cancel-delete-conteudo" data-id="${conteudo.id}">Não</button>
                    </div>
                    <span class="text-danger small d-none erro-delete-conteudo-${conteudo.id}"></span>
                </div>
                <span class="text-danger small d-none erro-material-${conteudo.id}"></span>
            </div>
        </details>
    `;
    return div;
}

async function init() {
    const usuario = getUsuario();

    // Redireciona se não for professor
    if (!usuario || usuario.tipo !== 'professor') {
        window.location.href = 'login.html';
        return;
    }

    // Atualiza navbar
    const btnAuth = document.getElementById('auth-button');
    if (btnAuth) btnAuth.textContent = usuario.nome;

    const lista   = document.getElementById('lista-conteudos');
    const loading = document.getElementById('loading');
    const vazio   = document.getElementById('vazio');
    const viewerOverlay = document.getElementById('viewer-overlay');
    const viewerClose = document.getElementById('viewer-close');

    if (viewerOverlay) {
        viewerOverlay.addEventListener('click', (event) => {
            if (event.target === viewerOverlay) {
                fecharVisualizador();
            }
        });
    }
    if (viewerClose) {
        viewerClose.addEventListener('click', fecharVisualizador);
    }

    let data;
    try {
        data = await listarConteudos();
    } catch (error) {
        console.error('Falha ao carregar conteúdos:', error);
        loading.classList.add('d-none');
        lista.innerHTML = '<div class="alert alert-danger">Erro ao carregar os conteúdos. Atualize a página.</div>';
        return;
    }

    loading.classList.add('d-none');

    if (!data || !Array.isArray(data.conteudos)) {
        const mensagem = data?.erro || 'Não foi possível carregar seus conteúdos.';
        lista.innerHTML = `<div class="alert alert-warning">${mensagem}</div>`;
        return;
    }

    // Filtra só os conteúdos do professor logado
    const meus = data.conteudos.filter(c => c.autor_id === usuario.id);

    if (!meus.length) {
        vazio.classList.remove('d-none');
        return;
    }

    // Renderiza cada card e carrega materiais
    for (const conteudo of meus) {
        const card = criarCardConteudo(conteudo);
        lista.appendChild(card);

        const dataMat = await listarMateriais(conteudo.id);
        if (dataMat.sucesso) renderizarMateriais(dataMat.materiais, conteudo.id);

        // Evento adicionar material
        card.querySelector('.btn-add-material').addEventListener('click', async (e) => {
            const id    = parseInt(e.currentTarget.dataset.conteudo);
            const nome  = card.querySelector('.input-nome-material').value.trim();
            const url   = card.querySelector('.input-url-material').value.trim();
            const arquivoInput = card.querySelector('.input-file-material');
            const arquivo = arquivoInput?.files?.[0] ?? null;
            const erro  = card.querySelector(`.erro-material-${id}`);

            erro.classList.add('d-none');

            if (!nome && !arquivo) {
                erro.textContent = 'Informe o nome do material ou selecione um arquivo.';
                erro.classList.remove('d-none');
                return;
            }

            if (!arquivo && !url) {
                erro.textContent = 'Informe a URL ou envie um arquivo.';
                erro.classList.remove('d-none');
                return;
            }

            const payloadNome = nome || (arquivo ? arquivo.name : 'Material');
            const res = await adicionarMaterial(id, payloadNome, url, arquivo);
            if (res.sucesso) {
                card.querySelector('.input-nome-material').value = '';
                card.querySelector('.input-url-material').value  = '';
                if (arquivoInput) arquivoInput.value = '';
                const atualizado = await listarMateriais(id);
                if (atualizado.sucesso) renderizarMateriais(atualizado.materiais, id);
            } else {
                erro.textContent = res.erro ?? res.erros?.join(', ') ?? 'Erro ao adicionar material.';
                erro.classList.remove('d-none');
            }
        });

        const btnDeleteConteudo = card.querySelector('.btn-delete-conteudo');
        const confirmBox = card.querySelector('.confirm-remocao-conteudo');
        const btnConfirmDelete = card.querySelector('.btn-confirm-delete-conteudo');
        const btnCancelDelete = card.querySelector('.btn-cancel-delete-conteudo');
        const errorDelete = card.querySelector(`.erro-delete-conteudo-${conteudo.id}`);

        btnDeleteConteudo?.addEventListener('click', () => {
            confirmBox?.classList.remove('d-none');
            if (errorDelete) errorDelete.classList.add('d-none');
        });

        btnCancelDelete?.addEventListener('click', () => {
            confirmBox?.classList.add('d-none');
        });

        btnConfirmDelete?.addEventListener('click', async () => {
            const dataRemocao = await removerConteudo(conteudo.id);
            if (dataRemocao.sucesso) {
                card.remove();
                if (!lista.children.length) {
                    lista.innerHTML = '<div class="alert alert-light">Você ainda não criou nenhum conteúdo.</div>';
                }
            } else {
                if (errorDelete) {
                    errorDelete.textContent = dataRemocao.erro ?? 'Erro ao excluir postagem.';
                    errorDelete.classList.remove('d-none');
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', init);