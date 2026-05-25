
// Global tracking counters for financial performance
let orderCounter = 1;
let globalRevenue = 0;
let globalOrdersCompleted = 0;

// Default menu items (will be overridden by localStorage if available)
let menuItems = [
    { id: 'burger', name: '🍔 Burger', price: 45.00 },
    { id: 'pizza', name: '🍕 Pizza', price: 75.00 },
    { id: 'chips', name: '🍟 Chips', price: 20.00 },
    { id: 'soda', name: '🥤 Soda', price: 15.00 },
    { id: 'coffee', name: '☕ Coffee', price: 18.00 },
    { id: 'dessert', name: '🍰 Dessert', price: 30.00 }
];

// LocalStorage key
const MENU_STORAGE_KEY = 'resstulist_menu';

/**
 * Initialize the calculator on page load
 * Load menu from LocalStorage or use default
 */
function initializeCalculator() {
    loadMenuFromStorage();
    renderMenuInCalculator();
    renderMenuAdminEditor();
}

/**
 * Load menu items from LocalStorage
 * Falls back to default menu if nothing is saved
 */
function loadMenuFromStorage() {
    const savedMenu = localStorage.getItem(MENU_STORAGE_KEY);
    if (savedMenu) {
        try {
            menuItems = JSON.parse(savedMenu);
        } catch (e) {
            console.error('Error parsing saved menu:', e);
            menuItems = getDefaultMenuItems();
        }
    }
}

/**
 * Get default menu items
 */
function getDefaultMenuItems() {
    return [
        { id: 'burger', name: '🍔 Burger', price: 45.00 },
        { id: 'pizza', name: '🍕 Pizza', price: 75.00 },
        { id: 'chips', name: '🍟 Chips', price: 20.00 },
        { id: 'soda', name: '🥤 Soda', price: 15.00 },
        { id: 'coffee', name: '☕ Coffee', price: 18.00 },
        { id: 'dessert', name: '🍰 Dessert', price: 30.00 }
    ];
}

/**
 * Render menu items in calculator (checkout buttons)
 */
function renderMenuInCalculator() {
    const container = document.getElementById('menuItemsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    menuItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `
            <label>
                <input type="checkbox" id="item_${item.id}" onchange="calculateOrder()">
                <span>${item.name}</span>
            </label>
            <span class="item-price">R ${item.price.toFixed(2)}</span>
        `;
        container.appendChild(div);
    });
}

/**
 * Render menu editor in Settings tab
 */
function renderMenuAdminEditor() {
    const container = document.getElementById('menuEditorList');
    if (!container) return;
    
    container.innerHTML = '';
    
    menuItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'menu-item-editor';
        div.innerHTML = `
            <div class="menu-item-editor-row">
                <div class="form-input-group">
                    <label>Item Name</label>
                    <input type="text" value="${item.name}" class="editor-name" data-index="${index}" placeholder="e.g., 🍔 Burger">
                </div>
                <div class="form-input-group">
                    <label>Price (R)</label>
                    <input type="number" value="${item.price.toFixed(2)}" class="editor-price" data-index="${index}" step="0.01" min="0" placeholder="e.g., 45.00">
                </div>
                <button class="btn btn-remove" onclick="deleteMenuItem(${index})">🗑️ Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

/**
 * Add a new menu item (in Settings tab)
 */
function addNewMenuItem() {
    const newItem = {
        id: 'item_' + Date.now(),
        name: 'New Item',
        price: 0.00
    };
    menuItems.push(newItem);
    renderMenuAdminEditor();
}

/**
 * Delete a menu item by index
 */
function deleteMenuItem(index) {
    if (confirm('Are you sure you want to delete this item?')) {
        menuItems.splice(index, 1);
        renderMenuAdminEditor();
    }
}

/**
 * Save menu to LocalStorage and update calculator
 */
function saveMenuToStorage() {
    // Collect updated values from editor inputs
    const editorNames = document.querySelectorAll('.editor-name');
    const editorPrices = document.querySelectorAll('.editor-price');
    
    editorNames.forEach((input, index) => {
        const nameValue = input.value.trim();
        const priceInput = editorPrices[index];
        const priceValue = parseFloat(priceInput.value) || 0;
        
        if (menuItems[index]) {
            menuItems[index].name = nameValue || 'Item';
            menuItems[index].price = priceValue;
        }
    });
    
    // Save to LocalStorage
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menuItems));
    
    // Update calculator UI immediately
    renderMenuInCalculator();
    calculateOrder();
    
    // Show success message
    showSuccessMessage();
}

/**
 * Show success message in Settings tab
 */
function showSuccessMessage() {
    const msg = document.getElementById('successMessage');
    if (msg) {
        msg.classList.add('show');
        setTimeout(() => {
            msg.classList.remove('show');
        }, 3000);
    }
}

/**
 * Calculates current selected items breakdown and updates UI
 */
function calculateOrder() {
    let subtotal = 0;
    const summaryContainer = document.getElementById('orderSummary');
    summaryContainer.innerHTML = ''; // Clear prior entries

    let itemsSelected = false;

    // Loop through menu items to evaluate active checkmarks
    menuItems.forEach(item => {
        const checkbox = document.getElementById('item_' + item.id);
        if (checkbox && checkbox.checked) {
            itemsSelected = true;
            const price = item.price;
            subtotal += price;

            // Generate clean UI summary item row
            const row = document.createElement('div');
            row.className = 'summary-item';
            row.innerHTML = `
                <span>${item.name}</span>
                <span class="item-price">R ${price.toFixed(2)}</span>
            `;
            summaryContainer.appendChild(row);
        }
    });

    // Fallback display if summary dashboard is bare
    if (!itemsSelected) {
        summaryContainer.innerHTML = '<p class="empty-summary-msg">No items selected yet.</p>';
    }

    // VAT is now 0% (removed tax overhead)
    const vatAmount = 0;
    const totalDue = subtotal + vatAmount;

    // Update financial fields in real-time
    document.getElementById('subtotalPrice').innerText = `R ${subtotal.toFixed(2)}`;
    document.getElementById('taxPrice').innerText = `R ${vatAmount.toFixed(2)}`;
    document.getElementById('totalPrice').innerText = `R ${totalDue.toFixed(2)}`;

    // Re-evaluate change calculations seamlessly if cash was already input
    calculateChange();
}

/**
 * Computes difference between cash tendered and current total due
 */
function calculateChange() {
    const totalText = document.getElementById('totalPrice').innerText;
    const totalDue = parseFloat(totalText.replace('R ', '')) || 0;
    const cashPaidInput = document.getElementById('cashPaid').value;
    const cashPaid = parseFloat(cashPaidInput) || 0;

    let changeDue = 0;
    if (cashPaid > totalDue) {
        changeDue = cashPaid - totalDue;
    }

    document.getElementById('changeDue').innerText = `R ${changeDue.toFixed(2)}`;
}

/**
 * Links order to queue structure and updates business metrics
 * Uses the customer's unique orderNum from waitlist for receipt generation
 */
function sendToKitchen() {
    // Read and parse all financial values directly from UI elements
    const subtotalText = document.getElementById('subtotalPrice').innerText;
    const taxText = document.getElementById('taxPrice').innerText;
    const totalText = document.getElementById('totalPrice').innerText;
    const changeText = document.getElementById('changeDue').innerText;
    const cashInput = document.getElementById('cashPaid').value;

    // Convert all values to clean floating point numbers
    const subtotal = parseFloat(subtotalText.replace('R ', '').trim()) || 0;
    const vat = parseFloat(taxText.replace('R ', '').trim()) || 0;
    const totalDue = parseFloat(totalText.replace('R ', '').trim()) || 0;
    const changeDue = parseFloat(changeText.replace('R ', '').trim()) || 0;
    const cashPaid = parseFloat(cashInput) || 0;

    // Guard rail validation rule: block bare orders
    if (totalDue === 0) {
        alert('Please select at least one item from the menu before sending to the kitchen.');
        return;
    }

    // Operational rule: clear payment details prior to submitting
    if (cashPaid < totalDue) {
        alert('Amount Tendered must be equal to or greater than the Total Due before processing.');
        return;
    }

    // Capture customer designation metadata from dropdown links
    const customerSelect = document.getElementById('activeCustomerSelect');
    const assignedCustomerId = customerSelect.value;
    let customerName = "Walk-in Customer";
    let orderNumForReceipt = orderCounter;

    if (assignedCustomerId) {
        // Safe cross-file lookup extraction inside waitlist.js storage
        const targetCustomer = (typeof waitingList !== 'undefined') ? waitingList.find(c => c.id == assignedCustomerId) : null;

        if (targetCustomer) {
            customerName = targetCustomer.name;
            // Use the customer's unique orderNum from the waiting list
            orderNumForReceipt = targetCustomer.orderNum;
        }
    }

    // Extract dynamic listing array of items purchased
    let selectedItemsList = [];
    menuItems.forEach(item => {
        const cb = document.getElementById('item_' + item.id);
        if (cb && cb.checked) {
            selectedItemsList.push(item.name);
        }
    });

    // Bundle financial blueprint structure with clean numeric values
    // Use the unique orderNum from waiting list or generate new one for walk-ins
    const orderReceiptData = {
        orderNum: orderNumForReceipt,
        customerName: customerName,
        items: selectedItemsList,
        subtotal: subtotal,
        vat: vat,
        total: totalDue,
        cash: cashPaid,
        change: changeDue,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Increment financial dashboard tallies
    globalRevenue += totalDue;
    globalOrdersCompleted += 1;
    orderCounter += 1;

    // Cross-file processing task: append receipt data packet structure into waiting list UI
    if (typeof attachReceiptToQueue === "function") {
        attachReceiptToQueue(assignedCustomerId, orderReceiptData);
    }

    // Sync financial metrics to metrics dashboard views
    updateFinancialDOM();

    // Reset current working layout fields clean for subsequent rounds
    resetCalculator();
    
    // Auto-navigate user to view incoming live ticket updates on waitlist
    if (typeof showTab === "function") {
        showTab('waitingList');
    }
}

/**
 * Refreshes management dashboard blocks
 */
function updateFinancialDOM() {
    document.getElementById('totalRevenue').innerText = `R ${globalRevenue.toFixed(2)}`;
    document.getElementById('ordersCompleted').innerText = globalOrdersCompleted;
}

/**
 * Flushes active form metrics back to zero clean slate
 */
function resetCalculator() {
    menuItems.forEach(item => {
        const cb = document.getElementById('item_' + item.id);
        if (cb) cb.checked = false;
    });
    document.getElementById('cashPaid').value = '';
    document.getElementById('activeCustomerSelect').selectedIndex = 0;
    calculateOrder();
}

// Initialize calculator on page load
window.addEventListener('DOMContentLoaded', initializeCalculator);
