//         /// Internal data storage array for managing customer queue objects
let waitingList = [];

/**
 * Adds a new party to the queue system array and builds out UI views
 */
function addCustomer() {
    const nameInput = document.getElementById('custName');
    const sizeInput = document.getElementById('partySize');
    const contactInput = document.getElementById('contactNo');

    let name = nameInput.value.trim();
    let size = parseInt(sizeInput.value);
    let contact = contactInput.value.trim();

    // Apply fallback defaults if fields are empty or invalid
    if (!name) {
        name = "Guest";
    }
    if (!size || isNaN(size)) {
        size = 1;
    }
    if (!contact) {
        contact = "N/A";
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
        
        // Contextual styling swap: Highlight border color if kitchen order is attached
        if (customer.receipt) {
            li.style.borderLeftColor = "#3498db";
            li.style.background = "#f0fdf4";
        }

        // Calculate total items ordered if receipt exists
        let customerDisplay = `${index + 1}. ${customer.name}`;
        if (customer.receipt) {
            // Parse items and calculate total quantity
            let totalItemsCount = 0;
            const r = customer.receipt;
            
            if (r.items && Array.isArray(r.items)) {
                totalItemsCount = r.items.length;
            } else if (r.items) {
                totalItemsCount = Object.keys(r.items).length;
            }
            
            customerDisplay += ` (${totalItemsCount} items ordered)`;
        } else {
            customerDisplay += ` (Party of ${customer.size})`;
        }

        // Left-side client info card markup
        let clientInfoHTML = `
            <div class="order-info">
                <strong>${customerDisplay}</strong>
                <p>📞 Contact: ${customer.contact}</p>
        `;

        // If kitchen order exists, attach status badges and order metadata summary
        if (customer.receipt) {
            clientInfoHTML += `
                <p style="color: #27ae60; font-weight: bold; margin-top: 4px;">
                    🍳 Order #${customer.receipt.orderNum} sent to Kitchen
                </p>
            `;
        }
        clientInfoHTML += `</div>`;

        // Right-side structural operational buttons
        let actionsHTML = `<div class="order-actions">`;
        
        if (customer.receipt) {
            // Action swap rule: If an order has been tracked, view full breakdown invoice modal
            actionsHTML += `
                <button class="btn-serve" style="background:#3498db; padding:8px 14px; font-size:12px; font-weight:600; border:none; border-radius:4px; color:white; cursor:pointer;" onclick="openReceiptModal(${customer.id})">View Receipt</button>
            `;
        }
        
        // Standard checkout / close out operations button
        actionsHTML += `
            <button class="btn-remove" style="padding: 8px 14px; font-size: 12px; font-weight: 600; border: none; border-radius: 4px; cursor: pointer; color: white; background: #e74c3c;" onclick="removeCustomer(${customer.id})">Remove</button>
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
    if (!dropdown) return;
    
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
            name: `Walk-in Customer`,
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
        <h4 style="text-align:center; margin-bottom:5px;">RESSTULIST TILL SLIP</h4>
        <p style="text-align: center; font-size: 11px; margin-top:0;">Powered by Naturi Web Solutions</p>
        <hr style="border: dashed 1px #cbd5e1; margin: 10px 0;">
        <p><strong>Order No:</strong> #${r.orderNum}</p>
        <p><strong>Customer:</strong> ${target.name}</p>
        <hr style="border: dashed 1px #cbd5e1; margin: 10px 0;">
        <p><strong>ITEMS ORDERED:</strong></p>
    `;

    // Support object keys map iteration or array layout seamlessly
    if (r.items && Array.isArray(r.items)) {
        r.items.forEach(item => {
            receiptHTML += `<p style="padding-left: 10px; margin:4px 0;">- ${item}</p>`;
        });
    } else if (r.items) {
        for (const item of Object.keys(r.items)) {
            receiptHTML += `<p style="padding-left: 10px; margin:4px 0;">- ${item}</p>`;
        }
    }

    receiptHTML += `
        <hr style="border: dashed 1px #cbd5e1; margin: 10px 0;">
        <p>Subtotal: <span style="float: right;">R ${parseFloat(r.subtotal).toFixed(2)}</span></p>
        <p>VAT (15%): <span style="float: right;">R ${parseFloat(r.vat).toFixed(2)}</span></p>
        <p style="font-weight: bold; font-size: 15px; margin-top: 5px;">
            TOTAL DUE: <span style="float: right;">R ${parseFloat(r.total).toFixed(2)}</span>
        </p>
        <hr style="border: dashed 1px #cbd5e1; margin: 10px 0;">
        <p>Cash Tendered: <span style="float: right;">R ${parseFloat(r.cash || 0).toFixed(2)}</span></p>
        <p style="color: #27ae60; font-weight: bold;">
            Change Paid: <span style="float: right;">R ${parseFloat(r.change || 0).toFixed(2)}</span>
        </p>
        <hr style="border: dashed 1px #cbd5e1; margin: 10px 0;">
        <h5 style="text-align: center; margin-top:10px;">THANK YOU FOR YOUR PATRONAGE!</h5>
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
