// Internal data storage array for managing customer queue objects
let waitingList = [];

/**
 * Adds a new party to the queue system array and builds out UI views
 */
function addCustomer() {
    const nameInput = document.getElementById('custName');
    const sizeInput = document.getElementById('partySize');
    const contactInput = document.getElementById('contactNo');

    const name = nameInput.value.trim();
    const size = parseInt(sizeInput.value);
    const contact = contactInput.value.trim();

    // Field integrity validations
    if (!name || !size || !contact) {
        alert('Please fill out all fields correctly before adding a customer.');
        return;
    }

    // Build the data object structure
    const customerObj = {
        id: Date.now(), // Unique ID milestone tag
        name: name,
        size: size,
        contact: contact,
        receipt: null   // Holds order data packet when sent from calculator
    };

    // Push into global cache array
    waitingList.push(customerObj);

    // Flush form inputs back to clear state
    nameInput.value = '';
    sizeInput.value = '';
    contactInput.value = '';

    // Synchronize updates across all interface templates
    renderWaitlist();
    updateCustomerDropdown();
}

/**
 * Iterates over current active array collections to paint clean queue templates
 */
function renderWaitlist() {
    const queueList = document.getElementById('queueList');
    const queueCount = document.getElementById('queueCount');
    const currentQueueStat = document.getElementById('currentQueue');
    const totalCustTodayStat = document.getElementById('totalCustToday');

    queueList.innerHTML = ''; // Wipe prior rows cleanly

    if (waitingList.length === 0) {
        queueList.innerHTML = '<li class="empty-list-msg">No customers currently in the queue.</li>';
        queueCount.innerText = "0";
        if (currentQueueStat) currentQueueStat.innerText = "0";
        return;
    }

    // Paint active line templates row by row
    waitingList.forEach((customer, index) => {
        const li = document.createElement('li');
        
        // Contextual styling swap: Highlight blue if kitchen order is attached
        if (customer.receipt) {
            li.style.borderLeftColor = "#3498db";
        }

        // Left-side client info card markup
        let clientInfoHTML = `
            <div class="order-info">
                <strong>${index + 1}. ${customer.name} (Party of ${customer.size})</strong>
                <p>📞 Contact: ${customer.contact}</p>
        `;

        // If kitchen order exists, attach status badges and order metadata summary
        if (customer.receipt) {
            clientInfoHTML += `
                <p style="color: #27ae60; font-weight: bold; margin-top: 4px;">
                    🍳 Order #${customer.receipt.orderNum} sent to Kitchen (${customer.receipt.timestamp})
                </p>
                <p style="font-size: 12px; color: #475569; font-style: italic;">
                    Items: ${customer.receipt.items.join(', ')}
                </p>
            `;
        }
        clientInfoHTML += `</div>`;

        // Right-side structural operational buttons
        let actionsHTML = `<div class="order-actions">`;
        
        if (customer.receipt) {
            // Action swap rule: If an order has been tracked, view full breakdown invoice modal
            actionsHTML += `
                <button class="btn-serve" onclick="openReceiptModal(${customer.id})">📄 View Receipt</button>
            `;
        }
        
        // Standard checkout / close out operations button
        actionsHTML += `
            <button class="btn-remove" onclick="removeCustomer(${customer.id})">❌ Complete</button>
        </div>`;

        li.innerHTML = clientInfoHTML + actionsHTML;
        queueList.appendChild(li);
    });

    // Sync numeric indicator tags on management dash metrics cards
    queueCount.innerText = waitingList.length;
    if (currentQueueStat) currentQueueStat.innerText = waitingList.length;
    
    // Accumulate running total counts of check-ins processed natively
    if (totalCustTodayStat) {
        const rawTotalToday = parseInt(totalCustTodayStat.innerText) || 0;
        if (waitingList.length > rawTotalToday) {
            totalCustTodayStat.innerText = waitingList.length;
        }
    }
}

/**
 * Feeds live data arrays cleanly down into the calculator dropdown selector
 */
function updateCustomerDropdown() {
    const dropdown = document.getElementById('activeCustomerSelect');
    
    // Save current user selection pointer index 
    const currentSelectedValue = dropdown.value;

    // Reset loop back to base fallback option block
    dropdown.innerHTML = '<option value="">-- Assign Order to Live Customer Queue (Optional) --</option>';

    // Loop through list and append dynamic active options
    waitingList.forEach(customer => {
        // Exclude options that already have an order attached to keep dropdown clean
        if (!customer.receipt) {
            const opt = document.createElement('option');
            opt.value = customer.id;
            opt.innerText = `${customer.name} (Party of ${customer.size})`;
            dropdown.appendChild(opt);
        }
    });

    // Re-assign previous selection if it still exists within unassigned queue arrays
    dropdown.value = currentSelectedValue;
}

/**
 * Handles cross-file storage bindings. Receives data packets straight from calculator.js
 */
function attachReceiptToQueue(customerId, receiptData) {
    // If no target explicit card was selected, spawn an automatic virtual walking client item tracking slot
    if (!customerId) {
        const virtualWalkIn = {
            id: Date.now(),
            name: `Walk-in (${receiptData.customerName} #${receiptData.orderNum})`,
            size: 1,
            contact: "N/A",
            receipt: receiptData
        };
        waitingList.push(virtualWalkIn);
    } else {
        // Safe mapping pointer linkage binding task
        const target = waitingList.find(c => c.id == customerId);
        if (target) {
            target.receipt = receiptData;
        }
    }

    // Refresh UI templates
    renderWaitlist();
    updateCustomerDropdown();
}

/**
 * Removes data item blocks from queue lists arrays cleanly
 */
function removeCustomer(id) {
    waitingList = waitingList.filter(c => c.id !== id);
    renderWaitlist();
    updateCustomerDropdown();
}

/**
 * Hydrates receipt markup data models out straight onto visible invoice overlay layers
 */
function openReceiptModal(customerId) {
    const target = waitingList.find(c => c.id == customerId);
    if (!target || !target.receipt) return;

    const r = target.receipt;
    const modalBody = document.getElementById('receiptModalBody');

    // Build raw traditional till receipt template 
    let receiptHTML = `
        <h4>RESSTULIST TILL SLIP</h4>
        <p style="text-align: center; font-size: 11px;">Powered by Naturi Web Solutions</p>
        <div class="receipt-divider"></div>
        <p><strong>Order No:</strong> #${r.orderNum}</p>
        <p><strong>Customer:</strong> ${r.customerName}</p>
        <p><strong>Time:</strong> ${r.timestamp}</p>
        <div class="receipt-divider"></div>
        <p><strong>ITEMS ORDERED:</strong></p>
    `;

    r.items.forEach(item => {
        receiptHTML += `<p style="padding-left: 10px;">- ${item}</p>`;
    });

    receiptHTML += `
        <div class="receipt-divider"></div>
        <p>Subtotal: <span style="float: right;">${r.subtotal}</span></p>
        <p>VAT (15%): <span style="float: right;">${r.vat}</span></p>
        <p style="font-weight: bold; font-size: 15px; margin-top: 5px;">
            TOTAL DUE: <span style="float: right;">${r.total}</span>
        </p>
        <div class="receipt-divider" style="border-top-style: dotted;"></div>
        <p>Cash Tendered: <span style="float: right;">${r.cash}</span></p>
        <p style="color: #e74c3c; font-weight: bold;">
            Change Paid: <span style="float: right;">${r.change}</span>
        </p>
        <div class="receipt-divider"></div>
        <h5 style="text-align: center; font-family: inherit;">THANK YOU FOR YOUR PATRONAGE!</h5>
    `;

    modalBody.innerHTML = receiptHTML;
    document.getElementById('receiptModal').style.display = 'flex';
}

/**
 * Flushes overlay flags to hide modal layer boxes
 */
function closeReceiptModal() {
    document.getElementById('receiptModal').style.display = 'none';
}
