// 1. Function to Load Header and Footer dynamically
async function loadComponents() {
    try {
        const headerRes = await fetch('header.html');
        const headerHtml = await headerRes.text();
        document.getElementById('header-placeholder').innerHTML = headerHtml;

        const footerRes = await fetch('footer.html');
        const footerHtml = await footerRes.text();
        document.getElementById('footer-placeholder').innerHTML = footerHtml;

        // Re-attach mobile menu logic now that header exists in the DOM
        setupNavigation();
    } catch (error) {
        console.error("Error loading components:", error);
    }
}

// 2. Setup Navigation (Mobile Menu & Active Links)
function setupNavigation() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if(mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Highlight active page link based on current URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Check if URL has a product inquiry pre-filled
    const urlParams = new URLSearchParams(window.location.search);
    const productQuery = urlParams.get('product');
    const messageBox = document.getElementById('contact-message');
    if(productQuery && messageBox) {
        messageBox.value = "Hi, I am interested in inquiring about product ID: " + productQuery;
    }
}

// 3. Simple CSV Parser
function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',');
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        // Splitting by comma, allowing for future expansion
        const values = lines[i].split(',');
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = values[j] ? values[j].trim() : '';
        }
        data.push(obj);
    }
    return data;
}

// 4. Function to Fetch and Display Products (UPDATED)
async function loadProducts(limit) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    try {
        const response = await fetch('products.csv');
        const csvText = await response.text();
        let products = parseCSV(csvText);

        if (limit) {
            products = products.slice(0, limit);
        }

        // Added data attributes and onclick to the card
        const productsHTML = products.map(p => `
            <div class="product-card" 
                 style="cursor: pointer;"
                 data-img="${p.image}" 
                 data-name="${p.name}" 
                 data-desc="${p.description}" 
                 data-price="${p.price}" 
                 onclick="openModal(this)">
                
                <div>
                    <div class="product-img" style="background-image: url('${p.image}'); background-size: cover; background-position: center;"></div>
                    <h3>${p.name}</h3>
                    <p>${p.description}</p>
                </div>
                <div class="product-meta">
                    <span class="price">${p.price}</span>
                    <!-- Added event.stopPropagation() so clicking "Inquire" doesn't open the modal -->
                    <a href="contact.html?product=${encodeURIComponent(p.name)}" class="btn" style="padding: 0.5rem 1.2rem; font-size: 0.9rem;" onclick="event.stopPropagation();">Inquire</a>
                </div>
            </div>
        `).join('');

        grid.innerHTML = productsHTML;

    } catch (error) {
        console.error("Error loading CSV:", error);
        grid.innerHTML = '<p style="text-align:center; color: #f43f5e; grid-column: 1/-1;">Error loading products. Make sure you are running via a server.</p>';
    }
}

// --- NEW MODAL FUNCTIONS ---

function openModal(element) {
    const modal = document.getElementById('product-modal');
    
    // Populate modal with data from the clicked card
    document.getElementById('modal-img').src = element.getAttribute('data-img');
    document.getElementById('modal-title').textContent = element.getAttribute('data-name');
    document.getElementById('modal-desc').textContent = element.getAttribute('data-desc');
    document.getElementById('modal-price').textContent = element.getAttribute('data-price');
    document.getElementById('modal-inquire').href = "contact.html?product=" + encodeURIComponent(element.getAttribute('data-name'));
    
    // Show the modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Close modal when clicking outside of the content box
window.addEventListener('click', function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) {
        closeModal();
    }
});
// 5. Initialize Everything on Page Load
document.addEventListener('DOMContentLoaded', () => {
    loadComponents();
    
    const grid = document.getElementById('product-grid');
    if (grid) {
        // Read the data-limit attribute (it is "3" on index.html, empty on products.html)
        const limit = grid.getAttribute('data-limit');
        loadProducts(limit ? parseInt(limit) : null);
    }
});