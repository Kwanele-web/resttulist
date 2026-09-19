import {
    menuContainer,
    statusIndicator,
    togglePresenceBtn,
    updatePresenceUI,
    renderMenu,
    renderMessage
} from './ui.js';
import { getMenuItems } from './data.js';

const STORAGE_KEY = 'resstulist_online_mode';

function createMenuMount() {
    // Keep the existing waiting-list application intact while adding the modular menu.
    if (menuContainer) return true;

    const section = document.createElement('section');
    section.id = 'live-menu-section';
    section.innerHTML = `
        <div class="modular-menu-header">
            <div>
                <h2>Live Menu</h2>
                <span id="status-indicator" class="status-badge status-online">Online Mode</span>
            </div>
            <button id="toggle-presence-btn" class="toggle-btn" type="button">
                Switch to Offline Mode
            </button>
        </div>
        <div id="menu-container" class="menu-grid" aria-live="polite"></div>
    `;
    document.querySelector('.container')?.appendChild(section);
    return Boolean(document.getElementById('menu-container'));
}

async function initApp() {
    if (!createMenuMount()) return;

    const container = document.getElementById('menu-container');
    const indicator = document.getElementById('status-indicator');
    const toggle = document.getElementById('toggle-presence-btn');
    const online = localStorage.getItem(STORAGE_KEY) !== 'false';

    indicator.textContent = online ? 'Online Mode' : 'Offline Mode';
    indicator.className = `status-badge ${online ? 'status-online' : 'status-offline'}`;
    toggle.textContent = online ? 'Switch to Offline Mode' : 'Switch to Online Mode';
    container.replaceChildren();
    const loading = document.createElement('p');
    loading.textContent = 'Loading menu items...';
    container.appendChild(loading);

    const result = await getMenuItems(online);
    // The helpers query the elements at module load time, so render against the
    // dynamically-created mount directly when the legacy page is being extended.
    const items = result.data || [];
    container.replaceChildren();
    if (!items.length) {
        const message = document.createElement('p');
        message.textContent = 'No menu items available.';
        container.appendChild(message);
    } else {
        items.forEach((item) => {
            const card = document.createElement('article');
            card.className = 'menu-card';
            card.innerHTML = `<div><h3></h3><p></p></div><div class="price"></div>`;
            card.querySelector('h3').textContent = item.name || 'Unnamed item';
            card.querySelector('p').textContent = item.description || 'No description provided.';
            const price = Number.parseFloat(item.price);
            card.querySelector('.price').textContent = Number.isFinite(price) ? `R ${price.toFixed(2)}` : 'Price unavailable';
            container.appendChild(card);
        });
    }

    toggle.onclick = () => {
        localStorage.setItem(STORAGE_KEY, String(!(localStorage.getItem(STORAGE_KEY) !== 'false')));
        initApp();
    };
}

window.addEventListener('DOMContentLoaded', initApp);
