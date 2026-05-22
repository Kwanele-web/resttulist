/* ==========================================================================
   TAB NAVIGATION LOGIC (js/tabs.js)
   Controls toggling between the active application views.
   ========================================================================== */

function showTab(tabName) {
    // 1. Hide all tab content screens by removing their 'active' CSS class
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));

    // 2. De-highlight all navigation buttons by removing their 'active' class
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));

    // 3. Make the selected tab screen visible
    document.getElementById(tabName).classList.add('active');

    // 4. Highlight the correct button cleanly using its attribute
    const targetBtn = Array.from(navBtns).find(btn => btn.getAttribute('onclick').includes(tabName));
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
}
