const titleMap = {
    home: 'Random Site',
    bio: 'Bio - Random Site',
    'bio/auston': 'Auston He - Random Site',
    'bio/brian': 'Brian Chen - Random Site'
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
            <section>
                <h1>Page not found</h1>
                <p>Could not load <strong>${page}</strong>.</p>
            </section>
        `;
    }
}

async function showPage(route) {
    const navRoute = route.startsWith('bio/') ? 'bio' : route;
    setActiveNav(navRoute);
    document.title = titleMap[route] || titleMap.home;
    await loadPage(route);
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

window.addEventListener('click', handleRouteClick);
window.addEventListener('popstate', updateRoute);
window.addEventListener('DOMContentLoaded', updateRoute);
