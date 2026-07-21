// Menu Component: Handles fetching and rendering menu items from Supabase

const MenuComponent = {
    // 1. Fetch menu items from the database
    async fetchItems() {
        const supabase = window.supabaseClient;
        
        try {
            const { data, error } = await supabase
                .from('menu') // Assumes your table name is 'menu'
                .select('*');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching menu from Supabase:', error.message);
            return null;
        }
    },

    // 2. Render items into your layout (designed to work with your current UI structure)
    renderMenu(items, containerElementId) {
        const container = document.getElementById(containerElementId);
        if (!container) return;

        if (!items || items.length === 0) {
            container.innerHTML = `<p class="error-msg">No menu items found. Please check your database.</p>`;
            return;
        }

        // Loop through data and build HTML string
        container.innerHTML = items.map(item => `
            <div class="menu-item" data-id="${item.id}">
                <img src="${item.image_url || 'placeholder.jpg'}" alt="${item.name}" class="item-img">
                <div class="item-details">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-description">${item.description || ''}</p>
                    <span class="item-price">R ${parseFloat(item.price).toFixed(2)}</span>
                    <button class="add-to-cart-btn" onclick="app.addToCart(${item.id})">Add to Order</button>
                </div>
            </div>
        `).join('');
    }
};

// Make it globally available for app.js
window.MenuComponent = MenuComponent;
