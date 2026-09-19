// UI-only helpers for the modular live menu feature.

export const menuContainer = document.getElementById('menu-container');
export const statusIndicator = document.getElementById('status-indicator');
export const togglePresenceBtn = document.getElementById('toggle-presence-btn');

export function updatePresenceUI(isOnline) {
    if (!statusIndicator || !togglePresenceBtn) return;

    statusIndicator.textContent = isOnline ? 'Online Mode' : 'Offline Mode';
    statusIndicator.className = `status-badge ${isOnline ? 'status-online' : 'status-offline'}`;
    togglePresenceBtn.textContent = isOnline
        ? 'Switch to Offline Mode'
        : 'Switch to Online Mode';
}

export function renderMessage(message, isError = false) {
    if (!menuContainer) return;
    menuContainer.replaceChildren();
    const paragraph = document.createElement('p');
    paragraph.className = isError ? 'menu-status-error' : 'menu-status-message';
    paragraph.textContent = message;
    menuContainer.appendChild(paragraph);
}

export function renderMenu(items = []) {
    if (!menuContainer) return;
    menuContainer.replaceChildren();

    if (items.length === 0) {
        renderMessage('No menu items available.');
        return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
        const card = document.createElement('article');
        card.className = 'menu-card';

        const content = document.createElement('div');
        const title = document.createElement('h3');
        title.textContent = item.name || 'Unnamed item';
        const description = document.createElement('p');
        description.textContent = item.description || 'No description provided.';
        content.append(title, description);

        const price = document.createElement('div');
        price.className = 'price';
        const numericPrice = Number.parseFloat(item.price);
        price.textContent = Number.isFinite(numericPrice)
            ? `R ${numericPrice.toFixed(2)}`
            : 'Price unavailable';

        card.append(content, price);
        fragment.appendChild(card);
    });
    menuContainer.appendChild(fragment);
}
