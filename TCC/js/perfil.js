
localStorage.setItem("usuarioLogado", "true");

// Redireciona para a página inicial
window.location.href = "index.html";

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
