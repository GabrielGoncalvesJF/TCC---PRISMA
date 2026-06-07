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
