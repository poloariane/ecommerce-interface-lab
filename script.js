// ============================================================================
// TASK 7: AUTHENTICATED FETCH WRAPPER & PROTECTED ROUTES
// ============================================================================
const LOGIN_PAGE_URL = 'login.html';
const CURRENT_PAGE = window.location.pathname.split('/').pop() || 'landing.html';

function redirectToLogin() {
    if (CURRENT_PAGE === LOGIN_PAGE_URL) return;

    // Preserve the original destination so the app can return the user after login.
    const redirectTarget = `${window.location.pathname}${window.location.search}`;
    window.location.href = `${LOGIN_PAGE_URL}?redirect=${encodeURIComponent(redirectTarget)}`;
}

function showAccessDeniedMessage(message = 'Access Denied') {
    const protectedContent = document.querySelector('[data-protected-content]');
    if (protectedContent) {
        protectedContent.style.display = 'none';
    }

    let accessDenied = document.getElementById('access-denied-message');
    if (!accessDenied) {
        accessDenied = document.createElement('div');
        accessDenied.id = 'access-denied-message';
        accessDenied.setAttribute('role', 'alert');
        accessDenied.style.cssText = `
            max-width: 720px;
            margin: 3rem auto;
            padding: 1.5rem;
            border: 1px solid #dc3545;
            border-radius: 8px;
            background: #fff5f5;
            color: #842029;
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
            text-align: center;
        `;
        document.body.appendChild(accessDenied);
    }

    accessDenied.textContent = message;
}

async function authFetch(url, options = {}) {
    const response = await fetch(url, {
        // Session auth depends on the browser sending the HttpOnly JSESSIONID cookie.
        credentials: 'same-origin',
        ...options,
        headers: {
            ...(options.headers || {})
        }
    });

    if (response.status === 401) {
        // 401 means there is no valid session, so the user must sign in.
        redirectToLogin();
        throw new Error('Unauthorized');
    }

    if (response.status === 403) {
        // 403 means the session exists but the user lacks permission for this resource.
        showAccessDeniedMessage('Access Denied: you do not have permission to view this page.');
        throw new Error('Forbidden');
    }

    return response;
}

window.authFetch = authFetch;

async function requireLoggedIn() {
    const protectedContent = document.querySelector('[data-protected-content]');
    const authCheckUrl = document.body?.dataset.authCheckUrl || '/api/user/me';

    if (!protectedContent) return true;

    protectedContent.style.display = 'none';

    try {
        // A lightweight user-info request verifies that the server recognizes the session cookie.
        const response = await authFetch(authCheckUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            showAccessDeniedMessage('Access Denied: unable to verify your session.');
            return false;
        }

        protectedContent.style.display = '';
        return true;
    } catch (error) {
        return false;
    }
}

// ============================================================================
// PRODUCT CLASS & DATA STRUCTURE
// ============================================================================
// Product class to define the structure of each product in our store
// This ensures all products have consistent properties and makes the code more maintainable
class Product {
    constructor(id, name, price, image, category = "Cosmetics") {
        this.id = id;           // Unique identifier for each product
        this.name = name;       // Product display name
        this.price = price;     // Product price in Philippine Pesos
        this.image = image;     // Path to product image file
        this.category = category; // Product category for filtering
    }
}

// ============================================================================
// PRODUCTS ARRAY - Contains at least 10 products as required
// ============================================================================
// Array of Product objects representing the store's inventory
// Using an array of objects allows us to dynamically render products instead of hardcoding HTML
const products = [
    new Product(1, "Luxury Face Cream", 330, "images/products/cosmetics/cream.jpg", "Cosmetics"),
    new Product(2, "Hydrating Serum", 450, "images/products/cosmetics/serum.jpg", "Cosmetics"),
    new Product(3, "Vitamin C Moisturizer", 380, "images/products/cosmetics/vitamin-c-moisturizer.jpg", "Cosmetics"),
    new Product(4, "Cotton T-Shirt", 250, "images/products/clothes/t-shirt.jpg", "Clothes"),
    new Product(5, "Denim Jeans", 890, "images/products/clothes/jeans.jpg", "Clothes"),
    new Product(6, "Hoodie Sweatshirt", 550, "images/products/clothes/hoodie.jpg", "Clothes"),
    new Product(7, "Dark Chocolate", 120, "images/products/food/chocolate.jpg", "Food"),
    new Product(8, "Potato Chips", 85, "images/products/food/chips.jpg", "Food"),
    new Product(9, "Green Tea", 150, "images/products/food/tea.jpg", "Food"),
    new Product(10, "Lipstick Set", 420, "images/products/cosmetics/lipstick.jpg", "Cosmetics"),
    new Product(11, "Eye Shadow Palette", 350, "images/products/cosmetics/eye-shadow.jpg", "Cosmetics"),
    new Product(12, "Running Shoes", 1200, "images/products/clothes/shoes.jpg", "Clothes")
];

// ============================================================================
// CART STATE MANAGEMENT
// ============================================================================
// Cart array to store items added by the user
// Each cart item contains: id, name, price, quantity, and image
let cart = [];

// Save cart to localStorage - this preserves cart data even after page reload
// Using localStorage allows the cart to persist across browser sessions
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage - retrieves previously saved cart data
// Called when the page loads to restore the user's previous cart state
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Helper function to find a product by its ID
// Uses the .find() array method to locate the product in the products array
function getProductById(id) {
    return products.find(product => product.id === parseInt(id));
}

// ============================================================================
// TASK 2: DYNAMIC PRODUCT RENDERING
// ============================================================================
// Renders all products dynamically to the products.html page
// This function creates HTML elements using createElement instead of innerHTML for security
// and to prevent XSS (Cross-Site Scripting) attacks
function renderProducts() {
    // Select the container where products will be displayed
    const productContainer = document.querySelector('.product-list');
    
    // Exit if we're not on a page with a product container (e.g., not products.html)
    if (!productContainer) return;
    
    // Clear existing content to avoid duplicates when re-rendering
    productContainer.innerHTML = '';
    
    // Loop through each product in the products array using forEach()
    // forEach() iterates over each product and executes the callback function
    products.forEach(product => {
        // Create the main article element that will hold each product card
        const article = document.createElement('article');
        article.classList.add('product-card');
        article.setAttribute('data-id', product.id); // Store product ID for animations
        
        // Create and configure product image element
        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;
        
        // Error handling for missing images - shows placeholder if image fails to load
        img.onerror = function() {
            this.src = 'images/placeholders/no-image.jpg';
            this.alt = 'Image not available';
        };
        
        // Create product name element using createElement and textContent
        // textContent is safer than innerHTML because it doesn't parse HTML
        const name = document.createElement('h2');
        name.textContent = product.name;
        
        // Create product price element
        const price = document.createElement('p');
        price.textContent = `Price: ₱${product.price}`;
        price.id = `price${product.id}`;
        price.classList.add('price-text');
        
        // Create product category element
        const category = document.createElement('p');
        category.textContent = `Category: ${product.category}`;
        category.style.fontSize = '0.9rem';
        category.classList.add('category-text');
        
        // Create button group container for action buttons
        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group');
        
        // Create "View Details" link
        const detailsLink = document.createElement('a');
        detailsLink.href = `detail.html?id=${product.id}`;
        detailsLink.textContent = 'View Details';
        detailsLink.classList.add('btn-link');
        
        // Create "Add to Cart" button with data-id attribute
        const addBtn = document.createElement('button');
        addBtn.textContent = 'Add to Cart';
        addBtn.classList.add('btn', 'add-to-cart');
        addBtn.setAttribute('data-id', product.id); // data-id stores product ID for event delegation
        
        // Assemble the product card by appending all elements
        buttonGroup.appendChild(detailsLink);
        buttonGroup.appendChild(addBtn);
        
        article.appendChild(img);
        article.appendChild(name);
        article.appendChild(price);
        article.appendChild(category);
        article.appendChild(buttonGroup);
        
        // Add the completed product card to the container
        productContainer.appendChild(article);
    });
}

// ============================================================================
// TASK 3: CART OPERATIONS
// ============================================================================
// Adds a product to the cart with specified quantity
function addToCart(productId, quantity = 1) {
    // Find the product in the products array
    const product = getProductById(productId);
    if (!product) return;
    
    // Check if the product already exists in the cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // If product exists, increase its quantity
        existingItem.quantity += quantity;
    } else {
        // If product doesn't exist, add new item to cart
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.image
        });
    }
    
    // Save updated cart to localStorage
    saveCart();
    // Re-render the cart to reflect changes
    renderCart();
    // Trigger animation feedback
    animateAddToCart(productId);
}

// Removes a product completely from the cart
// Uses .filter() to create a new array excluding the item to remove
function removeFromCart(productId) {
    // filter() creates a new array with all items that do NOT match the productId
    // This is a functional approach that doesn't mutate the original array directly
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
}

// Updates the quantity of a cart item
function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        // If quantity becomes 0 or negative, remove the item entirely
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            // Otherwise update the quantity
            item.quantity = newQuantity;
            saveCart();
            renderCart();
        }
    }
}

// ============================================================================
// TASK 3: CART RENDERING WITH .reduce() FOR TOTAL CALCULATION
// ============================================================================
// Renders the cart items on cart.html
// Uses .reduce() to calculate the total price - this is a key requirement
function renderCart() {
    const cartItemsList = document.querySelector('.cart .cart-items-list');
    const subtotalElement = document.querySelector('.subtotal h2');
    const emptyCartMessage = document.querySelector('.cart .empty-cart-message');
    
    if (!cartItemsList) return;
    
    // Clear the cart list before re-rendering
    cartItemsList.innerHTML = '';
    
    // Handle empty cart state
    if (cart.length === 0) {
        if (emptyCartMessage) {
            emptyCartMessage.classList.add('show');
        }
        if (subtotalElement) {
            subtotalElement.textContent = 'Subtotal: ₱0';
        }
        return;
    }
    
    // Hide empty cart message when cart has items
    if (emptyCartMessage) {
        emptyCartMessage.classList.remove('show');
    }
    
    // ========================================================================
    // USING .reduce() TO CALCULATE TOTAL PRICE
    // .reduce() accumulates values by iterating through the array
    // Parameters: accumulator (sum), current item (item), initial value (0)
    // For each item, we multiply price by quantity and add to running total
    // ========================================================================
    const total = cart.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
    
    // Update the subtotal display
    if (subtotalElement) {
        subtotalElement.textContent = `Subtotal: ₱${total}`;
    }
    
    // Loop through each cart item and create list elements
    // Uses forEach() to iterate over the cart array
    cart.forEach(item => {
        // Create list item container
        const li = document.createElement('li');
        
        // Create image container and image element
        const imgDiv = document.createElement('div');
        imgDiv.classList.add('cart-img');
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        
        // Error handling for missing cart images
        img.onerror = function() {
            this.src = 'images/placeholders/no-image.jpg';
            this.alt = 'Image not available';
        };
        
        imgDiv.appendChild(img);
        
        // Create details container for product information
        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('product-dtls');
        const detailsUl = document.createElement('ul');
        
        // Product name
        const nameLi = document.createElement('li');
        const nameH3 = document.createElement('h3');
        nameH3.textContent = item.name;
        nameLi.appendChild(nameH3);
        
        // Product price
        const priceLi = document.createElement('li');
        const priceP = document.createElement('p');
        priceP.textContent = `Price: ₱${item.price}`;
        priceLi.appendChild(priceP);
        
        // Quantity input with event listener for changes
        const qtyLi = document.createElement('li');
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.value = item.quantity;
        qtyInput.min = '1';
        qtyInput.setAttribute('data-id', item.id);
        // addEventListener for quantity changes - updates cart when user changes quantity
        qtyInput.addEventListener('change', (e) => {
            updateCartQuantity(item.id, parseInt(e.target.value));
        });
        qtyLi.appendChild(qtyInput);
        
        // Remove button with click event listener
        const removeLi = document.createElement('li');
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.classList.add('btn', 'remove-btn');
        removeBtn.addEventListener('click', () => {
            removeFromCart(item.id);
        });
        removeLi.appendChild(removeBtn);
        
        // Assemble the cart item
        detailsUl.appendChild(nameLi);
        detailsUl.appendChild(priceLi);
        detailsUl.appendChild(qtyLi);
        detailsUl.appendChild(removeLi);
        detailsDiv.appendChild(detailsUl);
        
        li.appendChild(imgDiv);
        li.appendChild(detailsDiv);
        cartItemsList.appendChild(li);
    });
}

// ============================================================================
// TASK 4: FORM VALIDATION WITH preventDefault()
// ============================================================================
// Sets up form validation for checkout and signup forms
function setupFormValidation() {
    const checkoutForm = document.querySelector('.payment form');
    const placeOrderBtn = document.querySelector('.order-sum .btn');
    
    // Handle checkout form submission
    if (checkoutForm || placeOrderBtn) {
        const form = checkoutForm || document.querySelector('form');
        if (form && form.id !== 'signup-form') {
            // addEventListener for form submit - uses preventDefault() to stop page reload
            form.addEventListener('submit', (e) => {
                e.preventDefault(); // Prevents page from reloading - REQUIRED in instructions
                validateCheckoutForm();
            });
        } else if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevents default button behavior
                validateCheckoutForm();
            });
        }
    }
    
    // Handle signup form submission
    const signupBtn = document.getElementById('sg-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevents page reload
            validateSignupForm();
        });
    }
}

// Loads and displays cart summary on checkout page
function loadCheckoutSummary() {
    const summarySubtotal = document.getElementById('summarySubtotal');
    if (!summarySubtotal) return;
    
    loadCart(); // Restore cart data
    
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const checkoutGrid = document.querySelector('.checkout-grid');
    
    // Show/hide checkout grid based on cart contents
    if (cart.length === 0) {
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        if (checkoutGrid) checkoutGrid.style.display = 'none';
        return;
    }
    
    if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    if (checkoutGrid) checkoutGrid.style.display = 'grid';
    
    // Calculate cart totals using .reduce()
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = 50;
    const taxRate = 0.12;
    const tax = subtotal * taxRate;
    const total = subtotal + shippingFee + tax;
    
    // Update summary display
    summarySubtotal.textContent = `₱${subtotal.toFixed(2)}`;
    const taxElement = document.getElementById('summaryTax');
    const totalElement = document.getElementById('summaryTotal');
    
    if (taxElement) taxElement.textContent = `₱${tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `₱${total.toFixed(2)}`;
}

// Helper function to display field errors for form validation
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('error'); // Add error class for styling
        // Create error message element dynamically
        const errorMsg = document.createElement('small');
        errorMsg.textContent = message;
        errorMsg.classList.add('error-message');
        errorMsg.style.color = '#dc3545';
        errorMsg.style.display = 'block';
        errorMsg.style.marginTop = '0.25rem';
        field.parentNode.appendChild(errorMsg);
    }
}

// Validates checkout form fields - REQUIRED in Task 4
// Checks all shipping fields and payment method selection
function validateCheckoutForm() {
    // Get all form field values
    const fullName = document.getElementById('fullName')?.value.trim();
    const country = document.getElementById('country')?.value.trim();
    const province = document.getElementById('province')?.value.trim();
    const city = document.getElementById('city')?.value.trim();
    const street = document.getElementById('street')?.value.trim();
    const zip = document.getElementById('zip')?.value.trim();
    
    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach(msg => msg.remove());
    document.querySelectorAll('.form-group input').forEach(input => input.classList.remove('error'));
    
    let isValid = true;
    
    // Validate each required field
    if (!fullName) {
        showFieldError('fullName', 'Please enter your full name.');
        isValid = false;
    }
    
    if (!country) {
        showFieldError('country', 'Please enter your country.');
        isValid = false;
    }
    
    if (!province) {
        showFieldError('province', 'Please enter your province.');
        isValid = false;
    }
    
    if (!city) {
        showFieldError('city', 'Please enter your municipality or city.');
        isValid = false;
    }
    
    if (!street) {
        showFieldError('street', 'Please enter your street or barangay.');
        isValid = false;
    }
    
    // Validate zip code - must be present and numeric with at least 4 digits
    if (!zip) {
        showFieldError('zip', 'Please enter your zip code.');
        isValid = false;
    } else if (zip && (zip.length < 4 || isNaN(zip))) {
        showFieldError('zip', 'Please enter a valid numeric zip code with at least 4 digits.');
        isValid = false;
    }
    
    // Validate payment method selection
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const paymentSelected = Array.from(paymentMethods).some(radio => radio.checked);
    
    if (!paymentSelected) {
        isValid = false;
        const paymentCard = document.querySelector('.payment-card');
        const errorMsg = document.createElement('small');
        errorMsg.textContent = 'Please choose a payment method.';
        errorMsg.classList.add('error-message');
        errorMsg.style.color = '#dc3545';
        errorMsg.style.display = 'block';
        errorMsg.style.marginTop = '0.5rem';
        paymentCard.appendChild(errorMsg);
    }
    
    // If all validations pass, process the order
    if (isValid) {
        // Calculate totals using .reduce() again
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + 50 + (subtotal * 0.12);
        
        // Create order object with all details
        const order = {
            id: '#' + Math.floor(Math.random() * 1000000),
            total: total,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            items: cart.map(item => `${item.name} x${item.quantity} - ₱${item.price * item.quantity}`),
            status: 'Processing',
            tracking: 'TRK' + Math.floor(Math.random() * 1000000000),
            shippingAddress: {
                fullName: fullName,
                country: country,
                province: province,
                city: city,
                street: street,
                zip: zip
            },
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
        };
        
        // Save order to localStorage for order history
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.unshift(order); // Add new order to beginning of array
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Clear the cart
        cart = [];
        saveCart();
        
        // Show success message and redirect
        alert(`Order placed successfully!\n\nOrder ID: ${order.id}\nTotal: ₱${total.toFixed(2)}\n\nThank you for your purchase!`);
        window.location.href = 'account.html';
    }
    
    return isValid;
}

// Validates signup form with email and password requirements
function validateSignupForm() {
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    let isValid = true;
    
    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach(msg => msg.remove());
    
    // Validate email field
    if (!emailInput || !emailInput.value.trim()) {
        isValid = false;
        if (emailInput) {
            emailInput.classList.add('error');
            const errorMsg = document.createElement('small');
            errorMsg.textContent = 'Email is required';
            errorMsg.classList.add('error-message');
            errorMsg.style.color = '#dc3545';
            emailInput.parentNode.appendChild(errorMsg);
        }
    } else if (!emailInput.value.includes('@')) {
        isValid = false;
        emailInput.classList.add('error');
        const errorMsg = document.createElement('small');
        errorMsg.textContent = 'Please enter a valid email address';
        errorMsg.classList.add('error-message');
        errorMsg.style.color = '#dc3545';
        emailInput.parentNode.appendChild(errorMsg);
    }
    
    // Validate password field (minimum 6 characters)
    if (!passwordInput || !passwordInput.value.trim()) {
        isValid = false;
        if (passwordInput) {
            passwordInput.classList.add('error');
            const errorMsg = document.createElement('small');
            errorMsg.textContent = 'Password is required';
            errorMsg.classList.add('error-message');
            errorMsg.style.color = '#dc3545';
            passwordInput.parentNode.appendChild(errorMsg);
        }
    } else if (passwordInput.value.length < 6) {
        isValid = false;
        passwordInput.classList.add('error');
        const errorMsg = document.createElement('small');
        errorMsg.textContent = 'Password must be at least 6 characters';
        errorMsg.classList.add('error-message');
        errorMsg.style.color = '#dc3545';
        passwordInput.parentNode.appendChild(errorMsg);
    }
    
    // Show success message if validation passes
    if (isValid) {
        console.log('Signup successful!');
        alert('Account created successfully!');
    }
}

// ============================================================================
// TASK 5: USER ACCOUNT & ORDER HISTORY
// ============================================================================
// Mock user data with order history - demonstrates object manipulation
const currentUser = {
    name: "Ariane",
    orderHistory: [
        { 
            id: "#001", 
            total: 380, 
            date: "January 15, 2024", 
            items: ["Luxury Face Cream - ₱380"], 
            status: "Delivered",
            tracking: "TRK123456789"
        },
        { 
            id: "#002", 
            total: 520, 
            date: "January 20, 2024", 
            items: ["Hydrating Serum - ₱450", "Lipstick Set - ₱70"], 
            status: "Pending",
            tracking: "TRK987654321"
        },
        { 
            id: "#003", 
            total: 890, 
            date: "January 25, 2024", 
            items: ["Denim Jeans - ₱890"], 
            status: "Shipped",
            tracking: "TRK456789123"
        },
        { 
            id: "#004", 
            total: 450, 
            date: "February 1, 2024", 
            items: ["Vitamin C Moisturizer - ₱380", "Green Tea - ₱70"], 
            status: "Delivered",
            tracking: "TRK789123456"
        },
        { 
            id: "#005", 
            total: 1200, 
            date: "February 5, 2024", 
            items: ["Running Shoes - ₱1200"], 
            status: "Processing",
            tracking: "TRK321654987"
        }
    ]
};

// Saved items array for wishlist functionality
let savedItems = [
    { id: 3, name: "Vitamin C Moisturizer", price: 380 },
    { id: 5, name: "Denim Jeans", price: 890 },
    { id: 10, name: "Lipstick Set", price: 420 }
];

// Sets up the account page with user data and dashboard
function setupAccountPage() {
    // Dynamic greeting - updates welcome message with user's name
    const welcomeHeader = document.getElementById('welcome-message');
    if (welcomeHeader) {
        welcomeHeader.textContent = `Welcome back, ${currentUser.name}!`;
    }
    
    // Update dashboard statistics
    const totalOrdersElement = document.getElementById('total-orders');
    const pendingOrdersElement = document.getElementById('pending-orders');
    const savedItemsElement = document.getElementById('saved-items');
    
    if (totalOrdersElement) {
        totalOrdersElement.textContent = `${currentUser.orderHistory.length} Orders`;
    }
    
    // Calculate pending orders using .filter() - creates new array with matching orders
    if (pendingOrdersElement) {
        const pendingCount = currentUser.orderHistory.filter(order => 
            order.status === "Pending" || order.status === "Processing"
        ).length;
        pendingOrdersElement.textContent = `${pendingCount} Order${pendingCount !== 1 ? 's' : ''}`;
    }
    
    if (savedItemsElement) {
        savedItemsElement.textContent = `${savedItems.length} Items`;
    }
    
    // Set up order history with expandable details
    setupOrderHistory();
}

// ============================================================================
// TASK 5: DYNAMIC ORDER HISTORY WITH <details> AND <summary>
// ============================================================================
// Creates expandable order history using <details> and <summary> elements
// Uses event listeners on summary elements to dynamically inject order details
function setupOrderHistory() {
    const orderContainer = document.getElementById('order-history-container');
    
    if (!orderContainer) return;
    
    orderContainer.innerHTML = '';
    
    // Loop through each order in the orderHistory array using forEach()
    currentUser.orderHistory.forEach((order, index) => {
        // Create article container for each order
        const article = document.createElement('article');
        article.classList.add('order-card');
        
        // Create details element - HTML5 element for expandable content
        const details = document.createElement('details');
        
        // Create summary element - the clickable header that toggles the details
        const summary = document.createElement('summary');
        summary.textContent = `${order.id} — ₱${order.total}`;
        
        // Container for order details that will be dynamically populated
        const orderDetailsDiv = document.createElement('div');
        orderDetailsDiv.classList.add('order-details-container');
        
        // addEventListener on summary - toggles order details dynamically
        // This demonstrates event handling and dynamic DOM injection
        summary.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default summary behavior
            
            const isOpen = details.hasAttribute('open');
            
            if (isOpen) {
                // Close the details and clear content
                details.removeAttribute('open');
                orderDetailsDiv.innerHTML = '';
            } else {
                // Open details and inject order information
                details.setAttribute('open', '');
                // Using innerHTML here is safe because data is controlled (not user input)
                orderDetailsDiv.innerHTML = `
                    <div class="order-details">
                        <p><strong>📅 Order Date:</strong> ${order.date}</p>
                        <p><strong>📦 Items:</strong></p>
                        <ul style="margin-top: 5px; margin-bottom: 10px;">
                            ${order.items.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                        <p><strong>💰 Total Amount:</strong> ₱${order.total}</p>
                        <p><strong>📊 Status:</strong> 
                            <span class="order-status status-${order.status.toLowerCase()}">
                                ${order.status}
                            </span>
                        </p>
                        <p><strong>🚚 Tracking Number:</strong> ${order.tracking}</p>
                        ${order.status === 'Delivered' ? 
                            '<p><strong>✅ Delivered on:</strong> ' + order.date + '</p>' : 
                            '<p><strong>⏳ Estimated Delivery:</strong> 3-5 business days</p>'
                        }
                    </div>
                `;
            }
        });
        
        // Assemble the order card
        details.appendChild(summary);
        details.appendChild(orderDetailsDiv);
        article.appendChild(details);
        orderContainer.appendChild(article);
    });
}

// Adds CSS styles for order status badges dynamically
function addStatusStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .order-status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: bold;
        }
        
        .status-delivered {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .status-shipped {
            background-color: #cce5ff;
            color: #004085;
        }
        
        .status-processing {
            background-color: #e2e3e5;
            color: #383d41;
        }
        
        .order-details ul {
            margin-left: 20px;
            color: var(--text-main);
        }
        
        .order-details ul li {
            margin: 5px 0;
        }
    `;
    document.head.appendChild(style);
}

// Updates saved items count display
function updateSavedItems(count) {
    const savedItemsElement = document.getElementById('saved-items');
    if (savedItemsElement) {
        savedItemsElement.textContent = `${count} Items`;
    }
}

// Sets up logout functionality with confirmation dialog
function setupLogout() {
    const logoutLink = document.getElementById('logout');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            const confirmLogout = confirm('Are you sure you want to logout?');
            if (!confirmLogout) {
                e.preventDefault(); // Prevent navigation if user cancels
            }
        });
    }
}

// ============================================================================
// TASK 6: INTERACTIVE FEEDBACK (ANIMATIONS)
// ============================================================================
// Adds fade-in animation to product cards when added to cart
// Uses classList.add() to apply CSS class and setTimeout to remove it
function animateAddToCart(productId) {
    // Find the product card that was clicked
    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    
    if (productCard) {
        // Add the fade-in class - triggers CSS animation
        productCard.classList.add('fade-in');
        
        // Use setTimeout to remove the class after animation completes (500ms)
        // This allows the animation to be triggered again on subsequent clicks
        setTimeout(() => {
            productCard.classList.remove('fade-in');
        }, 500);
    }
    
    // Show toast notification for visual feedback
    showToast('Item added to cart!');
}

// Creates and shows a temporary toast notification
function showToast(message) {
    // Remove existing toast if present
    let toast = document.querySelector('.toast-notification');
    if (toast) {
        toast.remove();
    }
    
    // Create new toast element
    toast = document.createElement('div');
    toast.textContent = message;
    toast.classList.add('toast-notification');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove toast after 3 seconds with slide-out animation
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast && toast.remove) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

// ============================================================================
// TASK 3: EVENT DELEGATION FOR ADD TO CART BUTTONS
// ============================================================================
// Uses event delegation pattern - single event listener instead of multiple
// This is more efficient and works for dynamically added buttons
function setupEventDelegation() {
    // Add ONE click listener to the entire body
    // Event bubbling allows us to catch clicks on any element
    document.body.addEventListener('click', (e) => {
        // Check if the clicked element has the 'add-to-cart' class
        // This ensures we only respond to cart buttons
        if (e.target.classList && e.target.classList.contains('add-to-cart')) {
            const productId = e.target.getAttribute('data-id');
            if (productId) {
                addToCart(parseInt(productId));
            }
        }
    });
}

// ============================================================================
// PRODUCT DETAIL PAGE SETUP
// ============================================================================
// Sets up the product detail page with dynamic content from URL parameters
function setupProductDetail() {
    // Get product ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId && document.querySelector('.product-details')) {
        const product = getProductById(productId);
        
        if (product) {
            // Populate all product details using DOM manipulation
            const productImg = document.getElementById('product-img');
            if (productImg) {
                productImg.src = product.image;
                productImg.alt = product.name;
                productImg.onerror = function() {
                    this.src = 'images/placeholders/no-image.jpg';
                    this.alt = 'Image not available';
                };
            }
            
            const productName = document.getElementById('product-name');
            if (productName) productName.textContent = product.name;
            
            const productPrice = document.getElementById('product-price');
            if (productPrice) productPrice.textContent = `Price: ₱${product.price}`;
            
            const productCategory = document.getElementById('product-category');
            if (productCategory) productCategory.textContent = `Category: ${product.category}`;
            
            // Update specification table
            const brandCell = document.querySelector('table tr:nth-child(1) td');
            const colorCell = document.querySelector('table tr:nth-child(2) td');
            const stockCell = document.querySelector('table tr:nth-child(3) td');
            
            if (brandCell) brandCell.textContent = product.name;
            if (colorCell) colorCell.textContent = 'White';
            if (stockCell) stockCell.textContent = 'In Stock';
            
            // Set up add to cart button on detail page
            const addToCartBtn = document.querySelector('.quantity .btn');
            if (addToCartBtn) {
                addToCartBtn.setAttribute('data-id', product.id);
                const quantityInput = document.querySelector('.quantity input');
                if (addToCartBtn && quantityInput) {
                    // Clone to remove existing event listeners
                    const newBtn = addToCartBtn.cloneNode(true);
                    addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);
                    
                    newBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const quantity = parseInt(quantityInput.value) || 1;
                        addToCart(product.id, quantity);
                    });
                }
            }
        }
    }
}

// ============================================================================
// LANDING PAGE SETUP
// ============================================================================
function setupLandingPage() {
    const shopNowBtn = document.querySelector('.hero .btn');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', () => {
            window.location.href = 'products.html';
        });
    }
}

// Sets up checkout page event listeners
async function setupCheckoutPage() {
    const checkoutGrid = document.querySelector('.checkout-grid');
    if (!checkoutGrid) return;

    const isLoggedIn = await requireLoggedIn();
    if (!isLoggedIn) return;

    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', (e) => {
            e.preventDefault();
            validateCheckoutForm();
        });
    }
    
    loadCheckoutSummary();
}

// Adds fallback images for any missing product images
function setupImageFallback() {
    const fallbackImage = 'images/placeholders/no-image.jpg';
    document.querySelectorAll('img').forEach(img => {
        if (!img.onerror) {
            img.onerror = function() {
                this.src = fallbackImage;
                this.alt = 'Image not available';
            };
        }
    });
}

// ============================================================================
// LANDING PAGE PRODUCT GRIDS
// ============================================================================
// Loads featured products on landing page (first 3 products)
function loadFeaturedProducts() {
    const featuredGrid = document.getElementById('featured-products-grid');
    if (!featuredGrid) return;
    
    const featuredProducts = products.slice(0, 3);
    featuredGrid.innerHTML = '';
    
    featuredProducts.forEach(product => {
        const productCard = createProductCard(product, 'featured');
        featuredGrid.appendChild(productCard);
    });
}

// Loads discounted products on landing page (products 4-6 with 20% discount)
function loadDiscountedProducts() {
    const discountedGrid = document.getElementById('discounted-products-grid');
    if (!discountedGrid) return;
    
    const discountedProducts = products.slice(3, 6);
    discountedGrid.innerHTML = '';
    
    discountedProducts.forEach(product => {
        const discountedPrice = Math.round(product.price * 0.8);
        const discountPercent = 20;
        const productCard = createProductCard(product, 'discount', discountedPrice, discountPercent);
        discountedGrid.appendChild(productCard);
    });
}

// Helper function to create product cards for landing page
// Creates DOM elements dynamically with createElement
function createProductCard(product, type, discountedPrice = null, discountPercent = null) {
    const card = document.createElement('div');
    card.classList.add('product-card');
    
    // Add click event to navigate to product details
    card.addEventListener('click', () => {
        window.location.href = `detail.html?id=${product.id}`;
    });
    
    // Add badge if needed (featured or discount)
    if (type === 'featured') {
        const badge = document.createElement('div');
        badge.classList.add('product-badge', 'featured-badge');
        badge.textContent = '⭐ Featured';
        card.appendChild(badge);
    } else if (type === 'discount' && discountPercent) {
        const badge = document.createElement('div');
        badge.classList.add('product-badge', 'discount-badge');
        badge.textContent = `-${discountPercent}% OFF`;
        card.appendChild(badge);
    }
    
    // Product image
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;
    img.onerror = function() {
        this.src = 'images/placeholders/no-image.jpg';
    };
    card.appendChild(img);
    
    // Product info container
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('product-info');
    
    const title = document.createElement('h3');
    title.textContent = product.name;
    infoDiv.appendChild(title);
    
    // Price display - shows discounted price if applicable
    const priceDiv = document.createElement('div');
    if (discountedPrice) {
        priceDiv.innerHTML = `
            <span class="discounted-price">₱${discountedPrice}</span>
            <span class="original-price">₱${product.price}</span>
        `;
    } else {
        priceDiv.innerHTML = `<span class="product-price">₱${product.price}</span>`;
    }
    infoDiv.appendChild(priceDiv);
    
    const category = document.createElement('div');
    category.classList.add('product-category');
    category.textContent = product.category;
    infoDiv.appendChild(category);
    
    // View Details button
    const viewDetailsBtn = document.createElement('button');
    viewDetailsBtn.textContent = 'View Details';
    viewDetailsBtn.classList.add('view-details-btn');
    viewDetailsBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click from firing twice
        window.location.href = `detail.html?id=${product.id}`;
    });
    infoDiv.appendChild(viewDetailsBtn);
    
    card.appendChild(infoDiv);
    
    return card;
}

// ============================================================================
// INITIALIZATION - DOMContentLoaded Event Listener
// ============================================================================
// Load cart data from localStorage
loadCart();

// Wait for DOM to be fully loaded before executing initialization
// This ensures all HTML elements are available for querySelector
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all page-specific functionality
    renderProducts();           // Task 2: Dynamic product rendering
    renderCart();               // Task 3: Cart rendering
    setupEventDelegation();     // Task 3: Event delegation for Add to Cart
    setupFormValidation();      // Task 4: Form validation with preventDefault
    setupAccountPage();         // Task 5: User account and order history
    setupProductDetail();       // Product detail page setup
    setupLandingPage();         // Landing page navigation
    setupLogout();              // Logout confirmation
    addStatusStyles();          // Add order status styles
    setupCheckoutPage();        // Checkout page setup
    setupImageFallback();       // Fallback images
    loadFeaturedProducts();     // Landing page featured products
    loadDiscountedProducts();   // Landing page discounted products
});
