
// Global tracking counters for financial performance
let orderCounter = 1;
let globalRevenue = 0;
let globalOrdersCompleted = 0;

// Centralized pricing architecture
const MENU_PRICES = {
    burger: 45.00,
    pizza: 75.00,
    chips: 20.00,
    soda: 15.00,
    coffee: 18.00,
    dessert: 30.00
};

/**
 * Calculates current selected items breakdown and updates UI
 */
function calculateOrder() {
    let subtotal = 0;
    const summaryContainer = document.getElementById('orderSummary');
    summaryContainer.innerHTML = ''; // Clear prior entries

    let itemsSelected = false;

    // Loop through menu keys to evaluate active checkmarks
    for (const item in MENU_PRICES) {
        const checkbox = document.getElementById(item);
        if (checkbox && checkbox.checked) {
            itemsSelected = true;
            const price = MENU_PRICES[item];
            subtotal += price;

            // Generate clean UI summary item row
            const row = document.createElement('div');
            row.className = 'summary-item';
            row.innerHTML = `
                <span>${checkbox.nextElementSibling.innerText}</span>
                <span class="item-price">R ${price.toFixed(2)}</span>
            `;
            summaryContainer.appendChild(row);
        }
    }

    // Fallback display if summary dashboard is bare
    if (!itemsSelected) {
        summaryContainer.innerHTML = '<p class="empty-summary-msg">No items selected yet.</p>';
    }

    // Process exact VAT metrics (South African standard: 15%)
    const vatAmount = subtotal * 0.15;
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

    // Extract dynamic listing array of items purchased (item keys only)
    let selectedItemsList = [];
    for (const item in MENU_PRICES) {
        const cb = document.getElementById(item);
        if (cb && cb.checked) {
            selectedItemsList.push(item);
        }
    }

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
    for (const item in MENU_PRICES) {
        const cb = document.getElementById(item);
        if (cb) cb.checked = false;
    }
    document.getElementById('cashPaid').value = '';
    document.getElementById('activeCustomerSelect').selectedIndex = 0;
    calculateOrder();
}
