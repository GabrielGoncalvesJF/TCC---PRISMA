// Offcanvas compartilhado — torna itens navegáveis e fecha painel antes de navegar
document.addEventListener('DOMContentLoaded', () => {
    function getUsuario() {
        try {
            return JSON.parse(localStorage.getItem('usuarioToken') || 'null');
        } catch {
            return null;
        }
    }

    const usuario = getUsuario();
    const authButtonContainer = document.getElementById('auth-button-container');
    const profileOffcanvasWrapper = document.getElementById('profile-offcanvas-wrapper');
    const authBtn = document.getElementById('auth-button');

    if (profileOffcanvasWrapper) {
        profileOffcanvasWrapper.style.display = usuario ? 'block' : 'none';
    }
    if (authButtonContainer) {
        authButtonContainer.style.display = usuario ? 'none' : 'block';
    }
    if (authBtn) {
        authBtn.textContent = usuario ? usuario.nome : 'Login';
        if (!usuario) {
            authBtn.href = 'login.html';
        }
    }

    const container = document.querySelector('.offcanvas-body .container-fluid');
    if (!container) return;

    // Fecha o offcanvas e navega para href
    function fecharENavegar(href) {
        const offcanvasEl = document.getElementById('demo');
        try {
            const bs = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
            bs.hide();
        } catch (err) {}
        setTimeout(() => { window.location.href = href; }, 200);
    }

    // Links: força navegação e UX de fechamento
    container.querySelectorAll('a').forEach(a => {
        a.style.display = 'block';
        a.style.textDecoration = 'none';
        a.style.color = 'inherit';
        a.style.cursor = 'pointer';
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (!href) return;
            e.preventDefault();
            fecharENavegar(href);
        });
    });

    // Botões e blocos não-âncora: mantém comportamento interno e aplica ações simples
    const acoes = [
        () => window.location.href = 'perfil.html',
        () => window.location.href = 'ajuda.html',
        () => window.location.href = 'configuracoes.html',
        () => window.location.href = 'info.html'
    ];

    Array.from(container.children).forEach((el, index) => {
        const tag = el.tagName.toLowerCase();
        if (tag === 'a' || tag === 'br') return;
        // Não sobrescreve elementos com controles próprios
        if (el.querySelector('button, a')) return;

        el.style.cursor = 'pointer';
        if (index < acoes.length) {
            el.addEventListener('click', () => {
                fecharENavegar((acoes[index] && acoes[index]()) || 'perfil.html');
            });
        }
    });

    // Logout — botão com id `logout-offcanvas` (se existir)
    const logoutBtn = document.getElementById('logout-offcanvas');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await fetch('api/model/logout.php', { method: 'POST' });
            } catch (err) {}
            localStorage.removeItem('usuarioToken');
            fecharENavegar('login.html');
        });
    }
});
