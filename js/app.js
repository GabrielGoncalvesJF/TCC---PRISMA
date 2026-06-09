
document.addEventListener('DOMContentLoaded', async () => {
    const itensDestaque = document.getElementById('destaque');
    const itensVest = document.getElementById('destaque-vest');
    const itensCurso = document.getElementById('destaque-curso');

    const authBtn = document.getElementById('auth-button');
    const profileOffcanvasWrapper = document.getElementById('profile-offcanvas-wrapper');
    const authButtonContainer = document.getElementById('auth-button-container');
    const logoutBtn = document.getElementById('logout-offcanvas');

    function getUsuario() {
        try {
            return JSON.parse(localStorage.getItem('usuarioToken') || 'null');
        } catch {
            return null;
        }
    }

    const usuario = getUsuario();

    if (usuario) {
        if (authButtonContainer) authButtonContainer.style.display = 'none';
        if (profileOffcanvasWrapper) profileOffcanvasWrapper.style.display = 'block';
    } else {
        if (authButtonContainer) authButtonContainer.style.display = 'block';
        if (profileOffcanvasWrapper) profileOffcanvasWrapper.style.display = 'none';

        if (authBtn) {
            authBtn.textContent = 'Login';
            authBtn.href = 'login.html';
        }
    }

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

    const LIMIT_PADRAO = 3;

    function limpar(container) {
        if (!container) return;
        container.innerHTML = '';
    }

    function criarCartaoConteudo(conteudo) {
        const card = document.createElement('div');
        card.className = 'card mb-3';
        card.style.background = '#0b2230';
        card.style.borderColor = '#7A9EB3';
        card.style.cursor = 'pointer';
        card.onclick = () => {
            window.location.href = `conteudo_estudo.html?id=${conteudo.id}`;
        };

        const titulo = conteudo.titulo ? String(conteudo.titulo) : '(sem título)';
        const autor = conteudo.autor_nome ? String(conteudo.autor_nome) : '';
        const tipo = conteudo.tipo ? String(conteudo.tipo) : '';

        card.innerHTML = `
            <div class="card-body" style="color:#dff3ff;">
                <div style="font-weight:700; margin-bottom:6px;">${titulo}</div>
                <div style="opacity:.9; font-size:.95rem;">
                    ${autor ? `<span>por ${autor}</span>` : ''}
                    ${autor && tipo ? ' • ' : ''}
                    ${tipo ? `<span>${tipo === 'aula' ? 'Aula' : 'Postagem'}</span>` : ''}
                </div>
            </div>
        `;

        return card;
    }

    function renderLista(container, conteudos) {
        if (!container) return;
        limpar(container);

        if (!Array.isArray(conteudos) || conteudos.length === 0) {
            container.innerHTML = '<p>Não possui conteúdo</p>';
            return;
        }

        conteudos.slice(0, LIMIT_PADRAO).forEach((conteudo) => {
            container.appendChild(criarCartaoConteudo(conteudo));
        });
    }

    async function fetchConteudos({ tipo } = {}) {
        const url = new URL('api/model/conteudos.php', window.location.origin);
        if (tipo && ['aula', 'postagem'].includes(tipo)) {
            url.searchParams.set('tipo', tipo);
        }

        const res = await fetch(url.toString(), { method: 'GET' });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.sucesso) {
            const erro = data?.erro || `HTTP ${res.status}`;
            throw new Error(erro);
        }

        return data.conteudos;
    }

    async function carregarDestaques() {
        try {
            const conteudos = await fetchConteudos();
            renderLista(itensDestaque, conteudos);
        } catch (e) {
            console.error('Erro ao carregar destaque geral:', e);
            renderLista(itensDestaque, []);
        }

        try {
            const conteudosVest = await fetchConteudos({ tipo: 'postagem' });
            renderLista(itensVest, conteudosVest);
        } catch (e) {
            console.error('Erro ao carregar destaque vestibular:', e);
            renderLista(itensVest, []);
        }

        try {
            const conteudosCurso = await fetchConteudos({ tipo: 'aula' });
            renderLista(itensCurso, conteudosCurso);
        } catch (e) {
            console.error('Erro ao carregar destaque curso:', e);
            renderLista(itensCurso, []);
        }
    }

    function inicializarOffcanvas() {
        const container = document.querySelector('.offcanvas-body .container-fluid');
        if (!container) return;

        // Define ações padrão para itens não-âncora
        const acoesOffcanvas = [
            () => window.location.href = 'perfil.html',
            () => window.location.href = 'ajuda.html',
            () => window.location.href = 'configuracoes.html',
            () => window.location.href = 'info.html'
        ];

        // Torna âncoras clicáveis em toda a área e garante navegação
        container.querySelectorAll('a').forEach(a => {
            a.style.display = 'block';
            a.style.textDecoration = 'none';
            a.style.color = 'inherit';
            a.addEventListener('click', (e) => {
                // Permite comportamento padrão mas garante navegação caso algo bloqueie
                if (!a.href) return;
                // Pequeno timeout para fechar offcanvas antes de navegar (UX)
                e.preventDefault();
                const href = a.getAttribute('href');
                const offcanvasEl = document.getElementById('demo');
                try {
                    const bs = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
                    bs.hide();
                } catch (err) {}
                setTimeout(() => { window.location.href = href; }, 200);
            });
            a.style.cursor = 'pointer';
        });

        // Aplica ações para elementos que não são âncoras (ex: bloco de logout)
        // Itera pelos filhos na ordem original para manter o mapeamento de posição
        Array.from(container.children).forEach((el, index) => {
            const tag = el.tagName.toLowerCase();
            if (tag === 'br') return;

            // âncoras já receberam listener acima
            if (tag === 'a') return;

            // se o elemento contém um botão/âncora interativa, não sobrescrever seu comportamento
            if (el.querySelector('button, a')) return;

            // aplica ação padrão baseada na posição original (se existir)
            if (index < acoesOffcanvas.length) {
                el.style.cursor = 'pointer';
                el.addEventListener('click', () => {
                    const offcanvasEl = document.getElementById('demo');
                    try {
                        const bs = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
                        bs.hide();
                    } catch (err) {}
                    acoesOffcanvas[index]();
                });
            }
        });
    }

    inicializarOffcanvas();
    await carregarDestaques();

    async function logout() {
        const res = await fetch('api/model/logout.php', { method: 'POST' });
        return await res.json();
    }
});


