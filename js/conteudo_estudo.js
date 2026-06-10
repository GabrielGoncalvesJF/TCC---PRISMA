// ------------------------------------------------------------
// CONTEÚDOS E AULAS
// ------------------------------------------------------------

async function listarConteudos(tipo = null) {
    const url = tipo ? `api/model/conteudos.php?tipo=${tipo}` : 'api/model/conteudos.php';
    const res = await fetch(url);
    return await res.json();
}
// Exemplo de uso:
// const data = await listarConteudos('aula');
// data.conteudos.forEach(c => console.log(c.titulo));


async function getConteudo(id) {
    const res = await fetch(`api/model/conteudos.php?id=${id}`);
    return await res.json();
}
// Exemplo de uso:
// const data = await getConteudo(1);
// console.log(data.conteudo.titulo);


async function criarConteudo(titulo, corpo, tipo = 'aula') {
    const res = await fetch('api/model/conteudos.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, corpo, tipo })
    });
    return await res.json();
}
// Exemplo de uso:
// const data = await criarConteudo('Aula 1', 'Conteúdo da aula...', 'aula');


async function editarConteudo(id, titulo, corpo) {
    const res = await fetch('api/model/conteudos.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, titulo, corpo })
    });
    return await res.json();
}
// Exemplo de uso:
// const data = await editarConteudo(1, 'Novo título', 'Novo conteúdo...');


async function deletarConteudo(id) {
    const res = await fetch('api/model/conteudos.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    return await res.json();
}
// Exemplo de uso:
// const data = await deletarConteudo(1);


// ------------------------------------------------------------
// COMENTÁRIOS
// ------------------------------------------------------------

async function listarComentarios(conteudoId) {
    const res = await fetch(`api/model/comentarios.php?conteudo_id=${conteudoId}`);
    return await res.json();
}
// Exemplo de uso:
// const data = await listarComentarios(1);
// data.comentarios.forEach(c => console.log(c.corpo));


async function criarComentario(conteudoId, corpo) {
    const res = await fetch('api/model/comentarios.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudo_id: conteudoId, corpo })
    });
    return await res.json();
}
// Exemplo de uso:
// const data = await criarComentario(1, 'Ótima aula!');


async function deletarComentario(id) {
    const res = await fetch('api/model/comentarios.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    return await res.json();
}
// Exemplo de uso:
// const data = await deletarComentario(5);


// ------------------------------------------------------------
// PÁGINA — conteudo_estudo.html
// ------------------------------------------------------------

function getParams() {
    return new URLSearchParams(window.location.search);
}

function getConteudoId() {
    const params = getParams();
    const idParam = params.get('id');
    const id = idParam ? parseInt(idParam, 10) : NaN;

    if (!Number.isNaN(id) && id > 0) {
        return id;
    }

    if (params.has('list')) {
        return null;
    }

    const fallback = parseInt(sessionStorage.getItem('conteudoEstudoId'), 10);
    if (!Number.isNaN(fallback) && fallback > 0) {
        return fallback;
    }

    return null;
}

function formatarData(str) {
    return new Date(str).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
}

function fotoOuInicial(nome, foto) {
    const wrap = document.getElementById('autor-foto-wrap');
    if (foto) {
        wrap.innerHTML = `<img src="api/img/${foto}" class="autor-foto" alt="${nome}">`;
    } else {
        const inicial = nome?.charAt(0).toUpperCase() ?? '?';
        wrap.innerHTML = `<div class="autor-foto-placeholder">${inicial}</div>`;
    }
}

function getUsuario() {
    try { return JSON.parse(localStorage.getItem('usuarioToken')); }
    catch { return null; }
}

function renderizarConteudo(conteudo) {
    const usuario = getUsuario();
    document.title = `${conteudo.titulo} — Prisma`;
    document.getElementById('conteudo-tipo').textContent = conteudo.tipo === 'aula' ? 'Aula' : 'Postagem';
    document.getElementById('conteudo-titulo').textContent = conteudo.titulo;
    document.getElementById('conteudo-autor').textContent  = conteudo.autor_nome;
    document.getElementById('conteudo-data').textContent   = formatarData(conteudo.criado_em);
    document.getElementById('conteudo-corpo').innerHTML    = conteudo.corpo;
    fotoOuInicial(conteudo.autor_nome, conteudo.autor_foto);

    if (usuario && usuario.tipo === 'professor' && usuario.id === conteudo.autor_id) {
        document.getElementById('btn-deletar-conteudo').style.display = 'inline-flex';
    }
}

function renderizarListaConteudos(conteudos) {
    const wrap = document.getElementById('conteudos-lista');
    if (!conteudos.length) {
        wrap.innerHTML = '<p class="text-muted small">Nenhum material enviado pelos professores foi encontrado.</p>';
        return;
    }

    wrap.innerHTML = conteudos.map(conteudo => {
        const titulo   = conteudo.titulo || '(sem título)';
        const autor    = conteudo.autor_nome || 'Professor';
        const data     = conteudo.criado_em ? formatarData(conteudo.criado_em) : '';
        const tipo     = conteudo.tipo === 'aula' ? 'Aula' : 'Postagem';
        const conteudoUrl = `conteudo_estudo.html?id=${conteudo.id}`;

        return `
            <div class="card shadow-sm mx-auto" style="max-width: 720px; width: 100%;">
                <div class="card-body">
                    <h5 class="mb-2"><a href="${conteudoUrl}" class="text-decoration-none">${titulo}</a></h5>
                    <div class="text-muted small mb-2">${tipo} • ${autor} • ${data}</div>
                    <p class="mb-0" style="text-align: justify;">${conteudo.corpo || ''}</p>
                </div>
            </div>
        `;
    }).join('');
}

async function carregarListaConteudos() {
    const wrap = document.getElementById('conteudos-lista');
    try {
        const data = await listarConteudos();
        if (!data.sucesso) {
            wrap.innerHTML = '<p class="text-muted small">Erro ao carregar a lista de conteúdos.</p>';
            return;
        }
        renderizarListaConteudos(data.conteudos || []);
    } catch {
        wrap.innerHTML = '<p class="text-muted small">Erro ao carregar a lista de conteúdos.</p>';
    }
}

async function carregarMateriais(conteudoId) {
    const wrap = document.getElementById('lista-materiais');
    try {
        const res  = await fetch(`api/model/materiais.php?conteudo_id=${conteudoId}`);
        const data = await res.json();
        if (!data.sucesso) {
            wrap.innerHTML = '<p class="text-muted small">Erro ao carregar materiais.</p>';
            return;
        }
        if (!data.materiais?.length) {
            wrap.innerHTML = '<p class="text-muted small">Nenhum material disponível.</p>';
            return;
        }

        wrap.innerHTML = data.materiais.map(m => {
            const label = m.nome || m.url || 'Material';
            const href = m.url || '#';
            return `
            <div class="d-flex align-items-center gap-2 mb-2">
                <i class="material-icons text-info">description</i>
                <a href="${href}" target="_blank" rel="noreferrer" class="text-decoration-none">
                    ${label}
                </a>
            </div>
        `;
        }).join('');
    } catch {
        wrap.innerHTML = '<p class="text-muted small">Erro ao carregar materiais.</p>';
    }
}

function renderizarComentarios(comentarios, usuarioAtual) {
    const lista = document.getElementById('lista-comentarios');
    document.getElementById('total-comentarios').textContent = comentarios.length;

    if (!comentarios.length) {
        lista.innerHTML = '<p class="text-muted small">Seja o primeiro a comentar!</p>';
        return;
    }

    lista.innerHTML = comentarios.map(c => {
        const inicial    = c.autor_nome?.charAt(0).toUpperCase() ?? '?';
        const fotoPerfil = c.autor_foto
            ? `<img src="api/img/${c.autor_foto}" class="autor-foto" alt="${c.autor_nome}">`
            : `<div class="autor-foto-placeholder">${inicial}</div>`;
        const podeDeletar = usuarioAtual && usuarioAtual.id === c.autor_id;

        return `
        <div class="comentario-card card mb-2 border-0 bg-light" data-id="${c.id}">
            <div class="card-body py-2 px-3">
                <div class="d-flex align-items-center gap-2 mb-1">
                    ${fotoPerfil}
                    <span class="fw-semibold small">${c.autor_nome}</span>
                    <span class="text-muted small ms-auto">${formatarData(c.criado_em)}</span>
                    ${podeDeletar ? `
                        <button class="btn btn-sm text-danger p-0 ms-2 btn-del-comentario" data-id="${c.id}">
                            <i class="material-icons" style="font-size:16px;">delete</i>
                        </button>` : ''}
                </div>
                <p class="mb-0 small">${c.corpo}</p>
            </div>
        </div>`;
    }).join('');

    document.querySelectorAll('.btn-del-comentario').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Deletar este comentário?')) return;
            const data = await deletarComentario(parseInt(btn.dataset.id));
            if (data.sucesso) {
                btn.closest('.comentario-card').remove();
                const total = document.getElementById('total-comentarios');
                total.textContent = parseInt(total.textContent) - 1;
            } else {
                alert(data.erro ?? 'Erro ao deletar comentário.');
            }
        });
    });
}

async function init() {
    const id = getConteudoId();

    const params = getParams();
    const mostrarLista = !id || params.has('list');

    if (mostrarLista) {
        document.getElementById('loading').classList.add('d-none');
        document.getElementById('erro').classList.add('d-none');
        document.getElementById('pagina-conteudo').classList.add('d-none');
        document.getElementById('lista-conteudos').classList.remove('d-none');
        await carregarListaConteudos();
        return;
    }

    const usuario = getUsuario();

    if (usuario) {
        const btn = document.getElementById('auth-button');
        if (btn) btn.textContent = usuario.nome;
    }

    const dataConteudo = await getConteudo(id);
    document.getElementById('loading').classList.add('d-none');

    if (!dataConteudo.sucesso) {
        document.getElementById('erro').classList.remove('d-none');
        return;
    }

    renderizarConteudo(dataConteudo.conteudo);
    document.getElementById('pagina-conteudo').classList.remove('d-none');

    const [_, dataComentarios] = await Promise.all([
        carregarMateriais(id),
        listarComentarios(id)
    ]);

    if (dataComentarios.sucesso) {
        renderizarComentarios(dataComentarios.comentarios, usuario);
    }

    if (usuario) {
        document.getElementById('form-comentario').classList.remove('d-none');
    } else {
        document.getElementById('aviso-login-comentario').classList.remove('d-none');
    }

    document.getElementById('btn-comentar')?.addEventListener('click', async () => {
        const input = document.getElementById('input-comentario');
        const erro  = document.getElementById('erro-comentario');
        const corpo = input.value.trim();
        erro.classList.add('d-none');

        if (!corpo) {
            erro.textContent = 'O comentário não pode estar vazio.';
            erro.classList.remove('d-none');
            return;
        }

        const btn = document.getElementById('btn-comentar');
        btn.disabled = true;
        btn.textContent = 'Enviando...';

        const data = await criarComentario(id, corpo);
        btn.disabled = false;
        btn.textContent = 'Comentar';

        if (data.sucesso) {
            input.value = '';
            const atualizado = await listarComentarios(id);
            if (atualizado.sucesso) renderizarComentarios(atualizado.comentarios, usuario);
        } else {
            erro.textContent = data.erro ?? data.erros?.join(', ') ?? 'Erro ao comentar.';
            erro.classList.remove('d-none');
        }
    });

    document.getElementById('btn-deletar-conteudo')?.addEventListener('click', async () => {
        if (!confirm('Tem certeza que deseja deletar este conteúdo?')) return;
        const data = await deletarConteudo(id);
        if (data.sucesso) {
            window.location.href = 'index.html';
        } else {
            alert(data.erro ?? 'Erro ao deletar.');
        }
    });
}

document.addEventListener('DOMContentLoaded', init);