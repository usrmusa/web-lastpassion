/* Last Passion - Ecommerce Logic */

const products = [
    { id: 1, name: 'International Baseball Jacket', price: 770, img: 'img/SignatureTee.jpg' },
    { id: 2, name: 'Hoodie', price: 699, img: 'img/hoodie.jpg' }
];

let cart = JSON.parse(localStorage.getItem('lastpassion_cart')) || [];

function initStore() {
    // Always update cart UI regardless of whether we are on a page with a product grid
    updateCartUI();

    const grid = document.getElementById('product-grid');
    if (!grid) return;
    
    const source = (window.products && window.products.length > 0) ? window.products : products;

    grid.innerHTML = source.map(p => `
        <div class="product-card">
            <img src="${p.img || (p.images && p.images[0])}" class="product-img" alt="${p.name}">
            <div class="product-info">
                <h3>${p.name}</h3>
                <p class="price">R ${p.price}.00</p>
                <button class="btn-add" onclick="showBetaDialog('${p.name}')">Add to Bag</button>
            </div>
        </div>
    `).join('');
}

function showBetaDialog(productName) {
    // Create modal if it doesn't exist
    if (!document.getElementById('betaModal')) {
        const modalHtml = `
            <div class="modal" id="betaModal" style="display:none;">
                <div class="modal-content" style="text-align: center;">
                    <h2 style="font-family: 'Bebas Neue'; margin-bottom: 15px;">Under Construction 🚧</h2>
                    <p style="color: var(--on-surface-variant); margin-bottom: 20px;">
                        Our online store is currently in <strong>BETA</strong>. <br>
                        You can still order <strong>${productName}</strong> directly via WhatsApp!
                    </p>
                    <button class="btn-checkout" style="background: var(--success-green); color: white; width: 100%; margin-bottom: 10px;" onclick="orderViaWhatsApp('${productName}')">
                        <i class="fa-brands fa-whatsapp"></i> Order on WhatsApp
                    </button>
                    <button class="btn-checkout" style="background: var(--surface-variant); color: var(--on-surface-variant); width: 100%;" onclick="closeBetaModal()">
                        Close
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    
    // Update the product name in the onclick handler if needed, but for simplicity we just show the modal
    // Ideally we would update the text dynamically, but re-creating it is fine for this simple use case
    // or we can just update the onclick function to use a global variable.
    // Let's just update the text content dynamically.
    const modal = document.getElementById('betaModal');
    const textP = modal.querySelector('p');
    textP.innerHTML = `Our online store is currently in <strong>BETA</strong>. <br> You can still order <strong>${productName}</strong> directly via WhatsApp!`;
    
    const waBtn = modal.querySelector('button[onclick^="orderViaWhatsApp"]');
    waBtn.setAttribute('onclick', `orderViaWhatsApp("${productName}")`);

    modal.style.display = 'flex';
}

function closeBetaModal() {
    const modal = document.getElementById('betaModal');
    if (modal) modal.style.display = 'none';
}

function orderViaWhatsApp(productName) {
    const message = `Hello Last Passion! I'm interested in ordering the "${productName}". Is it still available?`;
    window.location.href = `https://wa.me/27699671746?text=${encodeURIComponent(message)}`;
}

// Deprecated for now
function addToCart(id) {
    const source = (window.products && window.products.length > 0) ? window.products : products;
    const product = source.find(p => p.id == id);
    if (!product) return;

    cart.push(product);
    saveCart();
    updateCartUI();
    toggleCart(true);
}

function saveCart() {
    localStorage.setItem('lastpassion_cart', JSON.stringify(cart));
}

function toggleCart(open = null) {
    const sidebar = document.getElementById('cartSidebar');
    if (!sidebar) return;
    
    if (open === true) sidebar.classList.add('active');
    else if (open === false) sidebar.classList.remove('active');
    else sidebar.classList.toggle('active');
}

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.toggle('active');
    }
}

function updateCartUI() {
    const container = document.getElementById('cartItems');
    const count = document.querySelectorAll('.cart-count');
    const totalElem = document.getElementById('cartTotal');

    if (count) {
        count.forEach(el => el.innerText = cart.length);
    }
    
    if (container) {
        container.innerHTML = cart.map((item, index) => {
            let imgUrl = item.img || (item.images && item.images[0]);
            
            // Fix relative paths for local images in subfolders
            if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('/')) {
                const pathDepth = window.location.pathname.split('/').filter(p => p).length;
                // If we are in company/ or store/, we need to go up one level
                if (window.location.pathname.includes('/company/') || window.location.pathname.includes('/store/')) {
                    imgUrl = '../' + imgUrl;
                }
            }

            return `
                <div class="cart-item">
                    <img src="${imgUrl}" alt="${item.name}">
                    <div style="flex:1">
                        <h4 style="font-size: 14px">${item.name}</h4>
                        <p style="color: var(--primary-pink); font-weight:700">R ${item.price}.00</p>
                    </div>
                    <i class="fa-solid fa-trash" style="cursor:pointer; color:#ccc; font-size:12px" onclick="removeFromCart(${index})"></i>
                </div>
            `;
        }).join('');
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    if (totalElem) totalElem.innerText = `R ${total}.00`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function openCheckout() {
    if (cart.length === 0) return alert("Your bag is empty!");

    if (window.auth && !window.auth.currentUser) {
        const path = window.location.pathname;
        const currentPath = path.split('/').pop() || 'index.html';
        
        const isStore = path.includes('/store/');
        const isCompany = path.includes('/company/');
        
        const loginPath = (isStore || isCompany) ? '../authentication/login.html' : 'authentication/login.html';
        
        let returnUrl = `../${currentPath}`;
        if (isStore) returnUrl = `../store/${currentPath}`;
        if (isCompany) returnUrl = `../company/${currentPath}`;

        window.location.href = `${loginPath}?returnUrl=${encodeURIComponent(returnUrl)}`;
        return;
    }

    const modal = document.getElementById('checkoutModal');
    if (modal) {
        if (window.auth && window.auth.currentUser) {
            const nameInput = document.getElementById('custName');
            if (nameInput) nameInput.value = window.auth.currentUser.displayName || "";
        }
        modal.style.display = 'flex';
    }
}

function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.style.display = 'none';
}

function processOrder() {
    const name = document.getElementById('custName').value;

    if (!name) return alert("Please fill in your name.");

    const items = cart.map(i => i.name).join(', ');
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    const message = `Hello Last Passion! My name is ${name}. I'd like to order: ${items}. Total: R${total}. Please send payment link.`;
    
    window.location.href = `https://wa.me/27699671746?text=${encodeURIComponent(message)}`;
}

// Make functions global so they can be called from HTML
window.showBetaDialog = showBetaDialog;
window.closeBetaModal = closeBetaModal;
window.orderViaWhatsApp = orderViaWhatsApp;
window.addToCart = addToCart;
window.toggleCart = toggleCart;
window.removeFromCart = removeFromCart;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.processOrder = processOrder;
window.toggleMenu = toggleMenu;

// Dev Log
console.log("%cDeveloped by Musa Mgijima", "color: #ff0099; font-size: 20px; font-weight: bold;");
console.log("%cReach me at Digilayn Studio: https://digilayn.co.za", "color: #888; font-size: 14px;");
console.log("%cNOTICE: Unauthorized use or copying of this source code is strictly prohibited.", "color: red; font-weight: bold;");

document.addEventListener('DOMContentLoaded', initStore);
