// ============================================================
// app.js — Funções de comunicação com a API (PHP)
// Uso: importe as funções que precisar em cada página HTML
// ============================================================

// ------------------------------------------------------------
// AUTENTICAÇÃO
// ------------------------------------------------------------

async function cadastrar(nome, email, senha, senhaConfirma, tipo = 'aluno') {
    const res = await fetch('api/model/cadastro.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, senha_confirma: senhaConfirma, tipo })
    });
    return await res.json();
}
// Exemplo de uso:
// const data = await cadastrar('João', 'joao@email.com', '123456', '123456', 'aluno');
// if (data.sucesso) window.location.href = 'login.html';
// else console.log(data.erros);


async function logar(email, senha) {
    const res = await fetch('api/model/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });
    return await res.json();
}
// Exemplo de uso:
// const data = await logar('joao@email.com', '123456');
// if (data.sucesso) {
//     window.location.href = data.usuario.tipo === 'professor' ? 'postagem_prof.html' : 'index.html';
// }


async function logout() {
    const res = await fetch('api/model/logout.php', { method: 'POST' });
    return await res.json();
}
// Exemplo de uso:
// const data = await logout();
// if (data.sucesso) window.location.href = 'login.html';


// ------------------------------------------------------------
// PERFIL
// ------------------------------------------------------------

async function getPerfil() {
    const res = await fetch('api/model/perfil.php');
    return await res.json();
}
// Exemplo de uso:
// const data = await getPerfil();
// if (data.sucesso) console.log(data.usuario.nome);


async function atualizarPerfil(formData) {
    // formData: objeto FormData (necessário para envio de foto)
    const res = await fetch('api/model/perfil.php', {
        method: 'POST',
        body: formData
    });
    return await res.json();
}
// Exemplo de uso:
// const formData = new FormData();
// formData.append('nome', 'João Silva');
// formData.append('email', 'joao@email.com');
// formData.append('foto_perfil', inputFoto.files[0]); // opcional
// const data = await atualizarPerfil(formData);


// ------------------------------------------------------------
// CONTEÚDOS E AULAS
// ------------------------------------------------------------

async function listarConteudos(tipo = null) {
    const url = tipo ? `api/model/cadastro.php?tipo=${tipo}` : 'api/model/conteudos.php';
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
// MATERIAIS DO PROFESSOR
// ------------------------------------------------------------

async function listarMateriais(conteudoId) {
    const res = await fetch(`api/model/materiais.php?conteudo_id=${conteudoId}`);
    return await res.json();
}
// Exemplo de uso:
// const data = await listarMateriais(1);
// data.materiais.forEach(m => console.log(m.nome, m.url));


async function adicionarMaterial(conteudoId, nome, url) {
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
// Exemplo de uso:
// const data = await removerMaterial(3);


// ------------------------------------------------------------
// FÓRUM
// ------------------------------------------------------------

async function listarPosts() {
    const res = await fetch('api/model/forum.php');
    return await res.json();
}
// Exemplo de uso:
// const data = await listarPosts();
// data.posts.forEach(p => console.log(p.titulo, p.total_respostas));


async function getPost(id) {
    const res = await fetch(`api/model/forum.php?id=${id}`);
    return await res.json();
}
// Exemplo de uso:
// const data = await getPost(1);
// console.log(data.post.titulo, data.post.respostas);


async function criarPost(titulo, corpo) {
    const res = await fetch('api/model/forum.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, corpo })
    });
    return await res.json();
}
// Exemplo de uso:
// const data = await criarPost('Dúvida sobre a aula', 'Não entendi a parte 2...');


async function deletarPost(id) {
    const res = await fetch('api/model/forum.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    return await res.json();
}
// Exemplo de uso:
// const data = await deletarPost(1);


async function criarResposta(postId, corpo) {
    const res = await fetch('api/model/forum.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'resposta', post_id: postId, corpo })
    });
    return await res.json();
}
// Exemplo de uso:
// const data = await criarResposta(1, 'Boa pergunta! A resposta é...');


async function deletarResposta(id) {
    const res = await fetch('api/model/forum.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'resposta', id })
    });
    return await res.json();
}
// Exemplo de uso:
// const data = await deletarResposta(2);