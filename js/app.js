
document.addEventListener('DOMContentLoaded', async () => {
    const itensDestaque = document.getElementById('destaque');
    const itensVest = document.getElementById('destaque-vest');
    const itensCurso = document.getElementById('destaque-curso');

//    function criarDestaqueElemento( ) {
//        const postDiv = document.createElement('div');
//        postDiv.classList.add(' ');
//        produtoDiv.innerHTML = `
//            <img class=" " src="${}" alt="${}">
//            <div>
//
//            </div>
//        `;
//        return postDiv;
//    }

    // Referências aos elementos do HTML
    const authBtn = document.getElementById("auth-button");

    // Simulador de verificação: checa se existe um token salvo (ex: localStorage)
    const usuarioLogado = localStorage.getItem("usuarioToken");

    const profileOffcanvasWrapper = document.getElementById('profile-offcanvas-wrapper');
    const authButtonContainer = document.getElementById('auth-button-container');

    if (usuarioLogado) {
        if (authButtonContainer) authButtonContainer.style.display = 'none';
        if (profileOffcanvasWrapper) profileOffcanvasWrapper.style.display = 'block';
    } else {
        if (authButtonContainer) authButtonContainer.style.display = 'block';
        if (profileOffcanvasWrapper) profileOffcanvasWrapper.style.display = 'none';

        if (authBtn) {
            authBtn.textContent = "Login";
            authBtn.href = "login.html";
        }
    }

    // Log out do offcanvas
    const logoutBtn = document.getElementById('logout-offcanvas');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await logout();
            } catch (e) {
                console.error(e);
            } finally {
                localStorage.removeItem('usuarioToken');
                window.location.href = 'login.html';
            }
        });
    }

    // ==============================
    // Conteúdo dinâmico de destaque
    // ==============================

    const LIMIT_PADRAO = 3;

    function limpar(container) {
        if (!container) return;
        container.innerHTML = '';
    }

    function renderLista(container, conteudos) {
        if (!container) return;
        limpar(container);

        if (!Array.isArray(conteudos) || conteudos.length === 0) {
            container.innerHTML = '<p>Não possui conteúdo</p>';
            return;
        }

        conteudos.forEach((c) => {
            const card = document.createElement('div');
            card.className = 'card mb-3';
            card.style.background = '#0b2230';
            card.style.borderColor = '#7A9EB3';

            const titulo = c.titulo ? String(c.titulo) : '(sem título)';
            const autor = c.autor_nome ? String(c.autor_nome) : '';
            const tipo = c.tipo ? String(c.tipo) : '';

            card.innerHTML = `
                <div class="card-body" style="color:#dff3ff;">
                    <div style="font-weight:700; margin-bottom:6px;">${titulo}</div>
                    <div style="opacity:.9; font-size:.95rem;">
                        ${autor ? `<span>por ${autor}</span>` : ''}
                        ${autor && tipo ? ' • ' : ''}
                        ${tipo ? `<span>${tipo}</span>` : ''}
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    }

    async function fetchConteudos({ tipo, limite }) {
        const url = new URL('api/model/conteudos.php', window.location.origin);
        url.searchParams.set('limit', String(limite ?? LIMIT_PADRAO));

        // O backend atual não tem suporte a limit nem distingue 'vest/curso'.
        // Ainda assim, mantemos 'tipo' como parâmetro opcional.
        if (tipo && ['aula', 'postagem'].includes(tipo)) {
            url.searchParams.set('tipo', tipo);
        }

        // Observação: o PHP bloqueia se não estiver logado.
        // Vamos tentar mesmo assim; se der 401/erro, caímos no fallback.
        const res = await fetch(url.toString(), { method: 'GET' });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.sucesso) {
            const erro = data?.erro || `HTTP ${res.status}`;
            throw new Error(erro);
        }

        return data.conteudos;
    }

    async function carregarDestaques() {
        // Geral: mais recentes (sem filtrar por tipo)
        try {
            const conteudos = await fetchConteudos({ limite: LIMIT_PADRAO });
            renderLista(itensDestaque, conteudos);
        } catch (e) {
            renderLista(itensDestaque, []);
        }

        // Vest / Curso: enquanto o PHP vai fazer o mapeamento final,
        // aqui usamos uma heurística baseada em tipo.
        // - ajuste opcional: se você escolher A ou B, basta trocar aqui.
        const mapping = {
            'destaque-vest': 'postagem',
            'destaque-curso': 'aula'
        };

        try {
            const conteudosVest = await fetchConteudos({
                tipo: mapping['destaque-vest'],
                limite: LIMIT_PADRAO
            });
            renderLista(itensVest, conteudosVest);
        } catch (e) {
            renderLista(itensVest, []);
        }

        try {
            const conteudosCurso = await fetchConteudos({
                tipo: mapping['destaque-curso'],
                limite: LIMIT_PADRAO
            });
            renderLista(itensCurso, conteudosCurso);
        } catch (e) {
            renderLista(itensCurso, []);
        }
    }

    await carregarDestaques();
});

async function logout() {
    const res = await fetch('api/model/logout.php', { method: 'POST' });
    return await res.json();
}


