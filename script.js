import { db, COLLECTIONS, PRODUCT_VISIBILITY } from './core/FirebaseService.js';
import { collectionGroup, getDocs, query, where, limit } from "firebase/firestore";
import signatureTeeUrl from './img/SignatureTee.jpg';
import hoodieUrl from './img/hoodie.jpg';

// --- Fallback Data ---
const fallbackProducts = [
    { id: 'fb1', name: 'Signature Tee', price: 770, images: [signatureTeeUrl] },
    { id: 'fb2', name: 'Last Passion Hoodie', price: 699, images: [hoodieUrl] }
];

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
let allProducts = [];

// --- Initialization ---
export async function init() {
    updateCartUI();
    await loadProducts();
}

// --- Product Loading ---
async function loadProducts() {
    if (!productGrid) return;

    productGrid.innerHTML = '<div class="spinner"></div>';
    let productsToDisplay = [];

    try {
        const q = query(
            collectionGroup(db, 'items'),
            where("visibility", "==", PRODUCT_VISIBILITY.PUBLIC),
            limit(20)
        );

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            console.warn("Firebase returned no public products. Using fallback data.");
            productsToDisplay = fallbackProducts;
        } else {
            querySnapshot.forEach((doc) => {
                productsToDisplay.push({ id: doc.id, ...doc.data() });
            });
        }
    } catch (error) {
        console.error("Error loading products from Firebase:", error);
        console.warn("Using fallback data due to Firebase error.");
        productsToDisplay = fallbackProducts;
    }
    
    allProducts = productsToDisplay;
    renderProductGrid(productsToDisplay);
}

function renderProductGrid(products) {
    if (!productGrid) return;
    
    productGrid.innerHTML = '';

    if (!products || products.length === 0) {
        productGrid.innerHTML = '<p style="text-align:center; width:100%;">No products available at the moment.</p>';
        return;
    }

    products.forEach((product) => {
        const pid = product.id;
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.images ? product.images[0] : '/img/placeholder.jpg'}" class="product-img" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">R ${product.price}.00</p>
                <button class="btn-add" onclick="handleAddToCart('${pid}')">Add to Bag</button>
            </div>
        `;
        productGrid.appendChild(card);
    });
}


// --- Cart Logic ---
window.handleAddToCart = (id) => {
    const product = allProducts.find(p => p.id === id);
    if (!product) {
        console.error("Product not found for ID:", id);
        return;
    }
    
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ 
            id: product.id, 
            name: product.name, 
            price: product.price, 
            image: product.images ? product.images[0] : '', 
            quantity: 1 
        });
    }
    saveCart();
    updateCartUI();
    toggleCart(true);
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
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let count = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
            count += item.quantity;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <img src="${item.image || '/img/placeholder.jpg'}" alt="${item.name}">
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

        if(cartTotalEl) cartTotalEl.innerText = `R ${total.toFixed(2)}`;
    }
    
    if(cartCountEl) {
        cartCountEl.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.style.display = cart.length > 0 ? 'flex' : 'none';
    }
}

// --- UI Toggles ---
window.toggleCart = (forceOpen) => {
    if (cartSidebar) {
        if (forceOpen === true) {
            cartSidebar.classList.add('active');
        } else if (forceOpen === false) {
            cartSidebar.classList.remove('active');
        } else {
            cartSidebar.classList.toggle('active');
        }
    }
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

    const user = window.auth.currentUser;

    // If user is not logged in, redirect to login page with return URL
    if (!user) {
        const returnUrl = window.location.pathname + window.location.search;
        window.location.href = `/authentication/login.html?returnUrl=${encodeURIComponent(returnUrl)}`;
        return; // Stop execution
    }

    // If user is logged in, pre-fill their name and show the checkout modal
    if (custNameInput) {
        custNameInput.value = user.displayName || user.email || "";
    }
    
    if (checkoutModal) {
        checkoutModal.style.display = 'flex';
    }
    toggleCart(false); // Close the cart sidebar
};

window.closeCheckout = () => {
    if(checkoutModal) checkoutModal.style.display = 'none';
};

window.processOrder = () => {
    const name = custNameInput.value;
    if (!name) {
        alert("Please enter your name.");
        return;
    }

    let message = `*New Order from ${name}*\n\n`;
    let total = 0;
    cart.forEach(item => {
        message += `- ${item.quantity}x ${item.name} (R${item.price})\n`;
        total += item.price * item.quantity;
    });
    message += `\n*Total: R ${total.toFixed(2)}*`;
    message += `\n\nPlease confirm payment details.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "27659724645";
    
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    cart = [];
    saveCart();
    updateCartUI();
    closeCheckout();
};
