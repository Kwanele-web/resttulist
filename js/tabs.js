/* ==========================================================================
   TAB NAVIGATION LOGIC (js/tabs.js)
   Controls toggling between the active application views.
   ========================================================================== */

function showTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));

    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));

    const selectedTab = document.getElementById(tabName);
    if (selectedTab) selectedTab.classList.add('active');

    const targetBtn = Array.from(navBtns).find(btn =>
        (btn.getAttribute('onclick') || '').includes(tabName)
    );
    if (targetBtn) targetBtn.classList.add('active');
}

// Load the modular menu controller without replacing the existing application.
import('../app.js').catch(error => console.error('Modular menu failed to load:', error));
