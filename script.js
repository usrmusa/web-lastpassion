import { db, COLLECTIONS, PRODUCT_VISIBILITY } from './core/FirebaseService.js';
import { collectionGroup, getDocs, query, where, orderBy, limit } from "firebase/firestore";

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartSidebar = document.getElementById('cartSidebar');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.querySelector('.cart-count');
const checkoutModal = document.getElementById('checkoutModal');
const custNameInput = document.getElementById('custName');

// State
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// --- Initialization ---
export async function init() {
    updateCartUI();
    await loadProducts();
}

// --- Product Loading ---
async function loadProducts() {
    if (!productGrid) return;

    productGrid.innerHTML = '<div class="spinner"></div>';

    try {
        // CORRECTED QUERY: Use collectionGroup to get all "items" from any subcollection.
        const q = query(
            collectionGroup(db, 'items'),
            where("visibility", "==", PRODUCT_VISIBILITY.PUBLIC),
            limit(20)
        );

        const querySnapshot = await getDocs(q);
        productGrid.innerHTML = ''; // Clear loader

        if (querySnapshot.empty) {
            productGrid.innerHTML = '<p style="text-align:center; width:100%;">No products available at the moment.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const product = doc.data();
            const pid = doc.id;

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.images ? product.images[0] : 'img/placeholder.jpg'}" alt="${product.name}" loading="lazy">
                    ${product.isNew ? '<span class="badge new">NEW DROP</span>' : ''}
                    ${product.stock < 5 ? '<span class="badge low-stock">LOW STOCK</span>' : ''}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">R ${product.price.toFixed(2)}</p>
                    <button class="btn-add" onclick="addToCart('${pid}', '${product.name}', ${product.price}, '${product.images ? product.images[0] : ''}')">
                        ADD TO BAG
                    </button>
                </div>
            `;
            productGrid.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading products:", error);
        productGrid.innerHTML = '<p style="text-align:center; color:red;">Failed to load products. Please try again later.</p>';
    }
}

// --- Cart Logic ---
window.addToCart = (id, name, price, image) => {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, image, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    toggleCart(); // Open cart to show feedback
};

window.removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
};

window.updateQuantity = (id, change) => {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            updateCartUI();
        }
    }
};

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <img src="${item.image || 'img/placeholder.jpg'}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>R ${item.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
            <i class="fa-solid fa-trash remove-btn" onclick="removeFromCart('${item.id}')"></i>
        `;
        cartItemsContainer.appendChild(itemEl);
    });

    cartTotalEl.innerText = `R ${total.toFixed(2)}`;
    cartCountEl.innerText = count;
    
    // Update badge visibility
    if (count > 0) {
        cartCountEl.style.display = 'flex';
    } else {
        cartCountEl.style.display = 'none';
    }
}

// --- UI Toggles ---
window.toggleCart = () => {
    cartSidebar.classList.toggle('active');
};

window.toggleMenu = () => {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
};

// --- Checkout Logic ---
window.openCheckout = () => {
    if (cart.length === 0) {
        alert("Your bag is empty!");
        return;
    }
    
    // Pre-fill name if user is logged in
    const user = window.auth.currentUser;
    if (user) {
        custNameInput.value = user.displayName || user.email;
    } else {
        custNameInput.value = "Guest";
    }

    checkoutModal.style.display = 'flex';
    cartSidebar.classList.remove('active');
};

window.closeCheckout = () => {
    checkoutModal.style.display = 'none';
};

window.processOrder = () => {
    const name = custNameInput.value;
    if (!name) {
        alert("Please enter your name.");
        return;
    }

    // Construct WhatsApp Message
    let message = `*New Order from ${name}*\n\n`;
    let total = 0;
    cart.forEach(item => {
        message += `- ${item.quantity}x ${item.name} (R${item.price})\n`;
        total += item.price * item.quantity;
    });
    message += `\n*Total: R ${total.toFixed(2)}*`;
    message += `\n\nPlease confirm payment details.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "27659724645"; // Replace with actual business number
    
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    // Clear cart after "placing" order (optional, maybe wait for confirmation in real app)
    cart = [];
    saveCart();
    updateCartUI();
    closeCheckout();
};
