/* ==========================================================================
   ORDER CALCULATOR LOGIC (js/calculator.js)
   Handles price matrix mapping, totals, and invoice slip generators.
   ========================================================================== */

// Food items price matrix (Matches the ID values listed in index.html exactly)
const menuPrices = {
    burger: 45.00,
    pizza: 75.00,
    chips: 20.00,
    soda: 15.00,
    coffee: 18.00,
    dessert: 30.00
};

// Fixed local tax percentage setup (15% VAT for South African standards)
const TAX_RATE = 0.15;

/**
 * Sweeps all checkboxes and sums up the live active totals.
 */
function calculateOrder() {
    const summaryElement = document.getElementById('orderSummary');
    let subtotal = 0;
    
    // Clear the old receipt layout
    summaryElement.innerHTML = '';

    // Track if any boxes are checked
    let itemsSelected = false;

    // Loop through every menu key in our price list object
    for (const item in menuPrices) {
        const checkbox = document.getElementById(item);
        
        // If the box is checked by the user, add it to the active invoice bill
        if (checkbox && checkbox.checked) {
            itemsSelected = true;
            const itemPrice = menuPrices[item];
            subtotal += itemPrice;

            // Capitalise the item name for clean receipt formatting
            const cleanName = item.charAt(0).toUpperCase() + item.slice(1);

            // Create a row element for this menu selection
            const row = document.createElement('div');
            row.className = 'summary-item';
            row.innerHTML = `<strong>${cleanName}</strong> <span>R ${itemPrice.toFixed(2)}</span>`;
            
            summaryElement.appendChild(row);
        }
    }

    // If nothing is selected, show the default placeholder message
    if (!itemsSelected) {
        summaryElement.innerHTML = `<p class="empty-summary-msg">No items selected yet.</p>`;
    }

    // Run final tax and overall total mathematics equations
    const taxAmount = subtotal * TAX_RATE;
    const overallTotal = subtotal + taxAmount;

    // Push the calculated values out to update the display text labels
    document.getElementById('subtotalPrice').textContent = `R ${subtotal.toFixed(2)}`;
    document.getElementById('taxPrice').textContent = `R ${taxAmount.toFixed(2)}`;
    document.getElementById('totalPrice').textContent = `R ${overallTotal.toFixed(2)}`;
}

/**
 * Resets all checkboxes and wipes the receipt summaries completely clean.
 */
function resetCalculator() {
    for (const item in menuPrices) {
        const checkbox = document.getElementById(item);
        if (checkbox) {
            checkbox.checked = false;
        }
    }
    // Fire calculation function to refresh the blank defaults
    calculateOrder();
}

/**
 * Compiles the text from the receipt and copies it directly to the phone clipboard.
 */
function copyReceipt() {
    let receiptText = "=== RESTTULIST RECEIPT ===\n";
    let itemsSelected = false;

    for (const item in menuPrices) {
        const checkbox = document.getElementById(item);
        if (checkbox && checkbox.checked) {
            itemsSelected = true;
            const cleanName = item.charAt(0).toUpperCase() + item.slice(1);
            receiptText += `${cleanName}: R ${menuPrices[item].toFixed(2)}\n`;
        }
    }

    if (!itemsSelected) {
        alert("Your order summary is empty. Select items before copying.");
        return;
    }

    // Append calculated monetary totals to the bottom text string block
    const subtotal = parseFloat(document.getElementById('subtotalPrice').textContent.replace('R ', ''));
    const tax = parseFloat(document.getElementById('taxPrice').textContent.replace('R ', ''));
    const total = parseFloat(document.getElementById('totalPrice').textContent.replace('R ', ''));

    receiptText += "-------------------------\n";
    receiptText += `Subtotal: R ${subtotal.toFixed(2)}\n`;
    receiptText += `VAT (15%): R ${tax.toFixed(2)}\n`;
    receiptText += `TOTAL: R ${total.toFixed(2)}\n`;
    receiptText += "=========================\nThank you for your patronage!";

    // Write the raw compiled text directly into the system clipboard memory bank
    navigator.clipboard.writeText(receiptText)
        .then(() => alert("Receipt text successfully copied to clipboard!"))
        .catch(err => alert("Error copying text: " + err));
}
