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
