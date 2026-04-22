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

function bindRouteButtons() {
    document.querySelectorAll('[data-route]').forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            const route = button.dataset.route;
            if (route) {
                window.location.hash = route;
            }
        });
    });
}

async function loadPage(route) {
    const page = route || 'home';

    try {
        const res = await fetch(`pages/${page}.html`);
        if (!res.ok) throw new Error('Page not found');
        const html = await res.text();
        app.innerHTML = html;
    } catch (error) {
        app.innerHTML = `
            <section>
                <h1>Page not found</h1>
                <p>Could not load <strong>${page}</strong>.</p>
            </section>
        `;
    }

    bindRouteButtons();
}

async function showPage(route) {
    const navRoute = route.startsWith('bio/') ? 'bio' : route;
    setActiveNav(navRoute);
    document.title = titleMap[route] || titleMap.home;
    await loadPage(route);
}

function getCurrentRoute() {
    const hashRoute = window.location.hash.slice(1).replace(/^\/+|\/+$/g, '');
    return hashRoute || 'home';
}

function updateRoute() {
    showPage(getCurrentRoute());
}

window.addEventListener('hashchange', updateRoute);
window.addEventListener('DOMContentLoaded', updateRoute);
