const titleMap = {
    home: 'Kurrent',
    bio: 'Contributors - Kurrent',
    'bio/auston': 'Auston He - Kurrent',
    'bio/brian': 'Brian Chen - Kurrent',
    'todo': 'Todo App - Kurrent'
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
    const navRoute = route.startsWith('bio/') ? 'bio' : route;
    setActiveNav(navRoute);
    document.title = titleMap[route] || titleMap.home;
    await loadPage(route);
    
    if (route === 'todo') {
        initTodoApp();
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
// TODO APP
// ========================================

const STORAGE_KEY = 'kurrent_todos';

function getTodos() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveTodos(todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${minutes} ${ampm}`;
}

function renderTodos() {
    const listEl = document.getElementById('todo-list');
    const todos = getTodos();
    
    const totalEl = document.getElementById('stat-total');
    const activeEl = document.getElementById('stat-active');
    const completedEl = document.getElementById('stat-completed');
    
    if (totalEl) totalEl.textContent = todos.length;
    if (activeEl) activeEl.textContent = todos.filter(t => !t.completed).length;
    if (completedEl) completedEl.textContent = todos.filter(t => t.completed).length;
    
    if (!listEl) return;
    
    if (todos.length === 0) {
        listEl.innerHTML = `
            <li class="todo-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
                <h3>All caught up!</h3>
                <p>Add your first task to get started.</p>
            </li>
        `;
        return;
    }
    
    listEl.innerHTML = todos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleTodo('${todo.id}')">
                ${todo.completed ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
            </div>
            <div class="todo-content">
                <div class="todo-text">${escapeHtml(todo.text)}</div>
                ${todo.time ? `<div class="todo-time has-time"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${formatTime(todo.time)}</div>` : ''}
            </div>
            <button class="btn-icon" onclick="deleteTodo('${todo.id}')" title="Delete task">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
        </li>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addTodo() {
    const inputEl = document.getElementById('todo-input');
    const timeEl = document.getElementById('todo-time');
    const text = inputEl.value.trim();
    const time = timeEl.value;
    
    if (!text) return;
    
    const todos = getTodos();
    todos.unshift({
        id: generateId(),
        text: text,
        time: time,
        completed: false,
        createdAt: Date.now()
    });
    
    saveTodos(todos);
    inputEl.value = '';
    timeEl.value = '';
    inputEl.focus();
    renderTodos();
}

function toggleTodo(id) {
    const todos = getTodos();
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos(todos);
        renderTodos();
    }
}

function deleteTodo(id) {
    const todos = getTodos().filter(t => t.id !== id);
    saveTodos(todos);
    renderTodos();
}

function initTodoApp() {
    renderTodos();
    
    const inputEl = document.getElementById('todo-input');
    const timeEl = document.getElementById('todo-time');
    const addBtn = document.getElementById('todo-add-btn');
    
    if (addBtn) {
        addBtn.addEventListener('click', addTodo);
    }
    
    if (inputEl) {
        inputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTodo();
        });
    }
    
    if (timeEl) {
        timeEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTodo();
        });
    }
}

// Expose functions globally for inline onclick handlers
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;

// ========================================
// ROUTER EVENTS
// ========================================

window.addEventListener('click', handleRouteClick);
window.addEventListener('popstate', updateRoute);
window.addEventListener('DOMContentLoaded', updateRoute);
