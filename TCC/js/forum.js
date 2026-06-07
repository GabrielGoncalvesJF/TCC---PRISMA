// ------------------------------------------------------------
// FÓRUM
// ------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

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

});