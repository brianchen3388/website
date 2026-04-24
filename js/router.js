const titleMap = {
    home: 'Kurrent',
    bio: 'Contributors - Kurrent',
    'bio/auston': 'Auston He - Kurrent',
    'bio/brian': 'Brian Chen - Kurrent',
    'todo': 'Todo App - Kurrent',
    'pomodoro': 'Pomodoro - Kurrent'
};

const navLinks = document.querySelectorAll('.nav-links a');
const app = document.getElementById('app');

function setActiveNav(route) {
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.route === route);
    });
}

function normalizeRoute(route) {
    if (!route) return 'home';
    if (route === 'home') return 'home';
    return route.replace(/^\/|\/$/g, '');
}

function getCurrentRoute() {
    const hashRoute = window.location.hash.slice(1).replace(/^\/+|\/+$/g, '');
    const pathRoute = window.location.pathname.replace(/^\/|\/$/g, '');

    if (hashRoute) {
        const normalized = normalizeRoute(hashRoute);
        const path = normalized === 'home' ? '/' : '/' + normalized;
        history.replaceState({}, '', path);
        return normalized;
    }

    if (pathRoute && pathRoute !== 'index.html') {
        return normalizeRoute(pathRoute);
    }

    return 'home';
}

async function loadPage(route) {
    const page = route || 'home';

    try {
        const res = await fetch(`/pages/${page}.html`);
        if (!res.ok) throw new Error('Page not found');
        app.innerHTML = await res.text();
    } catch (error) {
        app.innerHTML = `
            <section class="page" style="text-align:center;padding:80px 20px;">
                <h1 style="font-size:3rem;margin-bottom:16px;">404</h1>
                <p style="color:var(--text-secondary);font-size:1.1rem;">Page not found.</p>
            </section>
        `;
    }
}

async function showPage(route) {
    if (typeof cleanupPomodoro === 'function') {
        cleanupPomodoro();
    }

    const navRoute = route.startsWith('bio/') ? 'bio' : route;
    setActiveNav(navRoute);
    document.title = titleMap[route] || titleMap.home;
    await loadPage(route);

    if (route === 'todo') {
        initTodoApp();
    }
    if (route === 'pomodoro') {
        initPomodoro();
    }
}

function updateRoute() {
    showPage(getCurrentRoute());
}

function handleRouteClick(event) {
    const anchor = event.target.closest('[data-route]');
    if (!anchor) return;

    event.preventDefault();
    const route = normalizeRoute(anchor.dataset.route);
    const path = route === 'home' ? '/' : '/' + route;
    history.pushState({}, '', path);
    updateRoute();
}

// ========================================
// ROUTER EVENTS
// ========================================

window.addEventListener('click', handleRouteClick);
window.addEventListener('popstate', updateRoute);
window.addEventListener('DOMContentLoaded', updateRoute);
