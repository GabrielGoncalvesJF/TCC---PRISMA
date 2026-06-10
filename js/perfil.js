
console.log('perfil.js carregado');
document.addEventListener('DOMContentLoaded', () => {
    console.log('perfil.js DOMContentLoaded');
    const inputNome = document.getElementById('input-nome');
    const inputEmail = document.getElementById('input-email');
    const inputSenhaAtual = document.getElementById('input-senha-atual');
    const inputSenhaNova = document.getElementById('input-senha-nova');
    const inputSenhaConfirma = document.getElementById('input-senha-confirma');
    const inputFoto = document.getElementById('input-foto');
    const formPerfil = document.getElementById('form-perfil');
    const perfilFormWrapper = document.getElementById('perfil-form-wrapper');
    const btnAlterarPerfil = document.getElementById('btn-alterar-perfil');
    const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');
    const mensagem = document.getElementById('perfil-mensagem');
    const perfilNome = document.getElementById('perfil-nome');
    const perfilTipo = document.getElementById('perfil-tipo');
    const perfilEmail = document.getElementById('perfil-email');
    const perfilFotoWrap = document.getElementById('perfil-foto-wrap');
    let previewUrl = '';

    function getUsuario() {
        try {
            return JSON.parse(localStorage.getItem('usuarioToken') || 'null');
        } catch {
            return null;
        }
    }

    function renderFotoPerfil(usuario) {
        if (!usuario) return;

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            previewUrl = '';
        }

        if (usuario.foto_perfil) {
            perfilFotoWrap.innerHTML = `<img src="${usuario.foto_perfil}" class="autor-foto" alt="Foto de perfil">`;
        } else {
            const inicial = usuario.nome?.charAt(0).toUpperCase() || '?';
            perfilFotoWrap.innerHTML = `<div class="autor-foto-placeholder">${inicial}</div>`;
        }
    }

    function renderUsuario(usuario) {
        if (!usuario) return;
        perfilNome.textContent = usuario.nome || 'Usuário';
        perfilTipo.textContent = usuario.tipo === 'professor' ? 'Professor' : 'Aluno';
        perfilEmail.textContent = usuario.email || '';
        inputNome.value = usuario.nome || '';
        inputEmail.value = usuario.email || '';
        renderFotoPerfil(usuario);
    }

    function atualizarUsuarioLocal(usuario) {
        if (!usuario) return;

        const local = getUsuario() || {};
        const novoUsuario = {
            ...local,
            ...usuario,
            nome: usuario.nome ?? local.nome,
            email: usuario.email ?? local.email,
            tipo: usuario.tipo ?? local.tipo,
            foto_perfil: usuario.foto_perfil ?? local.foto_perfil,
            id: usuario.id ?? local.id
        };

        localStorage.setItem('usuarioToken', JSON.stringify(novoUsuario));
    }

    async function carregarPerfil() {
        try {
            const res = await fetch('api/model/perfil.php');
            const data = await res.json();

            if (!res.ok || !data.sucesso) {
                console.warn('Perfil API não autorizada ou falhou; mantendo exibição local.');
                return;
            }

            atualizarUsuarioLocal(data.usuario);
            renderUsuario(data.usuario);
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
        }
    }

    function mostrarMensagem(texto, tipo = 'success') {
        mensagem.textContent = texto;
        mensagem.className = tipo === 'success'
            ? 'text-success small'
            : 'text-danger small';
        mensagem.classList.remove('d-none');
    }

    function alternarEdicao(visivel) {
        if (!perfilFormWrapper) return;
        perfilFormWrapper.classList.toggle('d-none', !visivel);
        if (btnAlterarPerfil) {
            btnAlterarPerfil.textContent = visivel ? 'Fechar edição' : 'Alterar informações';
        }
        if (!visivel) {
            mensagem.classList.add('d-none');
            inputSenhaAtual.value = '';
            inputSenhaNova.value = '';
            inputSenhaConfirma.value = '';
        }
    }

    function alterarInformacoes() {
        const estaVisivel = !perfilFormWrapper.classList.contains('d-none');
        alternarEdicao(!estaVisivel);
    }

    window.alterarInformacoes = alterarInformacoes;

    async function init() {
        const usuario = getUsuario();
        if (!usuario) {
            window.location.href = 'login.html';
            return;
        }

        renderUsuario(usuario);
        await carregarPerfil();

        btnAlterarPerfil?.addEventListener('click', alterarInformacoes);
        btnCancelarEdicao?.addEventListener('click', () => {
            if (inputFoto) {
                inputFoto.value = '';
            }
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                previewUrl = '';
            }
            renderUsuario(getUsuario());
            alternarEdicao(false);
        });

        inputFoto?.addEventListener('change', () => {
            const file = inputFoto.files?.[0];
            if (!file) {
                renderUsuario(getUsuario());
                return;
            }

            if (!file.type.startsWith('image/')) {
                return;
            }

            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }

            previewUrl = URL.createObjectURL(file);
            perfilFotoWrap.innerHTML = `<img src="${previewUrl}" class="autor-foto" alt="Pré-visualização da foto">`;
        });

        formPerfil.addEventListener('submit', async (event) => {
            event.preventDefault();
            mensagem.classList.add('d-none');

            const formData = new FormData();
            formData.append('nome', inputNome.value.trim());
            formData.append('email', inputEmail.value.trim());
            formData.append('senha_atual', inputSenhaAtual.value);
            formData.append('senha_nova', inputSenhaNova.value);
            formData.append('senha_confirma', inputSenhaConfirma.value);
            if (inputFoto.files.length > 0) {
                formData.append('foto_perfil', inputFoto.files[0]);
            }

            try {
                const res = await fetch('api/model/perfil.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();

                if (!res.ok || !data.sucesso) {
                    mostrarMensagem(data.erros?.[0] || data.erro || 'Erro ao atualizar o perfil.', 'error');
                    return;
                }

                mostrarMensagem(data.mensagem || 'Perfil atualizado com sucesso!');
                inputSenhaAtual.value = '';
                inputSenhaNova.value = '';
                inputSenhaConfirma.value = '';
                if (inputFoto) {
                    inputFoto.value = '';
                }
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    previewUrl = '';
                }
                await carregarPerfil();
                alternarEdicao(false);
            } catch (error) {
                console.error(error);
                mostrarMensagem('Erro na conexão. Tente novamente.', 'error');
            }
        });
    }

    init();
});
