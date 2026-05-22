/* ==========================================================================
       if (waitingList.length === 0) {
        listElement.innerHTML = `<li class="empty-list-msg">No customers currently in the queue.</li>`;
        updateMetrics();
        return;
    }

    // Generate functional rows for each customer card object
    waitingList.forEach((customer, index) => {
        const li = document.createElement('li');
        /* ==========================================================================
   WAITING LIST MANAGER LOGIC (js/waitlist.js)
   Handles the queue array, live metrics tracking, and rendering rows.
   ========================================================================== */

// Main array to hold all live queue objects
let waitingList = [];

// Global statistics counters (preserved during the session)
let totalCustomersToday = 0;
let totalWaitTime = 0;
let servedCount = 0;

/**
 * Adds a new customer to the array and updates the display.
 */
function addCustomer() {
    const nameInput = document.getElementById('custName');
    const sizeInput = document.getElementById('partySize');
    const contactInput = document.getElementById('contactNo');

    // Simple validation rule: Block empty fields
    if (!nameInput.value || !sizeInput.value || !contactInput.value) {
        alert("Please fill in all customer details before adding.");
        return;
    }

    const guestCount = parseInt(sizeInput.value);

    // Build the clean customer object mapping data keys
    const customer = {
        id: Date.now(), // Unique identifier based on execution timestamp
        name: nameInput.value.trim(),
        size: guestCount,
        contact: contactInput.value.trim(),
        joinedAt: new Date() // Logs exact entry time
    };

    // Push into our live array tracking setup
    waitingList.push(customer);
    
    // UPGRADED: Counts individual heads inside the party toward the total customer count
    totalCustomersToday += guestCount;

    // Clear input forms immediately for the next entry
    nameInput.value = '';
    sizeInput.value = '';
    contactInput.value = '';

    // Refresh layout views
    updateQueueDisplay();
}

/**
 * Loops through the array and generates the HTML view.
 */
function updateQueueDisplay() {
    const listElement = document.getElementById('queueList');
    const counterElement = document.getElementById('queueCount');
    
    // Clear old list rows out before rebuilding
    listElement.innerHTML = '';
    
    // Update the live header counter indicator
    counterElement.textContent = waitingList.length;

    // Show a clean placeholder text if no one is waiting
    if (waitingList.length === 0) {
        listElement.innerHTML = `<li class="empty-list-msg">No customers currently in the queue.</li>`;
        updateMetrics();
        return;
    }

    // Generate functional rows for each customer card object
    waitingList.forEach((customer, index) => {
        const li = document.createElement('li');
        
        li.innerHTML = `
            <div class="order-info">
                <strong>${customer.name} (Party of ${customer.size})</strong>
                <p>📞 Contact: ${customer.contact}</p>
                <p>⏰ Joined: ${customer.joinedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
            <div class="order-actions">
                <button class="btn-serve" onclick="serveCustomer(${customer.id})">Serve</button>
                <button class="btn-remove" onclick="removeCustomer(${customer.id})">Remove</button>
            </div>
        `;
        
        listElement.appendChild(li);
    });

    // Sync metrics dashboard display layout
    updateMetrics();
}

/**
 * Processes serving a customer and computes cumulative average wait durations.
 */
function serveCustomer(id) {
    const index = waitingList.findIndex(c => c.id === id);
    if (index !== -1) {
        const servedCustomer = waitingList[index];
        const waitDuration = Math.round((new Date() - servedCustomer.joinedAt) / 60000); // Minutes calculation

        totalWaitTime += waitDuration;
        servedCount++;

        // Remove from current queue array
        waitingList.splice(index, 1);
        updateQueueDisplay();
    }
}

/**
 * Drops a customer record completely out of the active list stack.
 */
function removeCustomer(id) {
    waitingList = waitingList.filter(customer => customer.id !== id);
    updateQueueDisplay();
}

/**
 * Updates the dashboard elements on the interface.
 */
function updateMetrics() {
    document.getElementById('totalCustToday').textContent = totalCustomersToday;
    document.getElementById('currentQueue').textContent = waitingList.length;
    
    // Calculate accurate average minutes safely without dividing by zero
    const average = servedCount > 0 ? Math.round(totalWaitTime / servedCount) : 0;
    document.getElementById('avgWaitTime').textContent = `${average} min`;
}
