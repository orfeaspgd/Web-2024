// Function to fetch and display requests
async function fetchAndDisplayRequests() {
    try {
        const response = await fetch('/get-requests-by-citizen');

        const requests = await response.json();

        const requestsContainer  = document.getElementById('requests');
        requestsContainer .innerHTML = ''; // Clear existing list

        // Check if there are no requests
        if (requests.length === 0) {
            requestsContainer.innerHTML = '<p>No requests found.</p>';
            return;
        }

        // Define a mapping for status codes
        const statusMapping = {
            'pending': 'Pending',
            'in_progress': 'In Progress',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };

        requests.forEach(request => {
            const requestElement = document.createElement('div');
            requestElement.classList.add('col-md-3');

            requestElement.innerHTML = `
                <div class="card mb-1">
                    <div class="card-body">
                        <p class="card-text"><strong>Product:</strong> ${request.product_id.name}</p>
                        <p class="card-text"><strong>Status:</strong> ${statusMapping[request.status]}</p>
                        <p class="card-text"><strong>Quantity:</strong> ${request.quantity}</p>
                        <p class="card-text"><strong>Created At:</strong> ${new Date(request.createdAt).toLocaleDateString()}</p>
                        <p class="card-text"><strong>Assigned At:</strong> ${request.assignedAt ? new Date(request.assignedAt).toLocaleDateString() : 'N/A'}</p>
                        <p class="card-text"><strong>Completed At:</strong> ${request.completedAt ? new Date(request.completedAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                </div>
            `;

            requestsContainer.appendChild(requestElement);
        });

    } catch (error) {
        console.error('Error fetching and displaying requests:', error);
    }
}

// Function to fetch categories from the server and populate the category dropdown
async function fetchCategories() {
    try {
        const response = await fetch('/categories');
        const categories = await response.json();

        const categorySelect = document.getElementById('category');
        categorySelect.innerHTML = `<option value="" disabled selected>Select a category</option>`; // Reset

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category._id;
            option.textContent = category.category_name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

// Function to fetch products based on the selected category and populate the product dropdown
async function fetchProductsByCategory(categoryId) {
    try {
        const response = await fetch(`/get-products-by-category/${categoryId}`);
        const products = await response.json();

        const productSelect = document.getElementById('product');
        productSelect.innerHTML = `<option value="" disabled selected>Select a product</option>`; // Reset

        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product._id; // Assuming _id is the product ID
            option.textContent = product.name;
            productSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Define suggestions container element for product search
const suggestionsContainer = document.getElementById('productSuggestions');

// Function to get products by search term and populate the product dropdown (for search functionality)
async function fetchProductSuggestions(query) {
    try {
        const response = await fetch(`/get-products-by-searching/${query}`);
        const suggestions = await response.json();

        // Clear previous suggestions
        suggestionsContainer.innerHTML = '';

        // Create suggestion links for each product found only if there are suggestions
        if (Array.isArray(suggestions) && suggestions.length > 0) {
            suggestions.forEach(product => {
                const suggestion = document.createElement('a');
                suggestion.classList.add('list-group-item', 'list-group-item-action');
                suggestion.textContent = product.name;
                suggestion.href = '#';

                // Handle suggestion selection
                suggestion.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.getElementById('productSearch').value = product.name;
                    suggestionsContainer.innerHTML = '';
                });

                suggestionsContainer.appendChild(suggestion);
            });
        }
    } catch (error) {
        console.error('Error fetching product suggestions:', error);
    }
}

// Get the category, the product dropdown and the product search input field elements
const categorySelectElement = document.getElementById('category');
const productSelectElement = document.getElementById('product');
const productSearchElement = document.getElementById('productSearch');

// Disable autocomplete search if a product is selected from the dropdown
productSelectElement.addEventListener('change', () => {
    productSearchElement.disabled = true;
    productSearchElement.value = '';
    suggestionsContainer.innerHTML = '';
});

// Disable the product dropdown and category selection if a product is searched for
productSearchElement.addEventListener('input', () => {
    if (productSearchElement.value.trim().length > 0) {
        productSelectElement.disabled = true;
        categorySelectElement.disabled = true;
    } else {
        productSelectElement.disabled = false;
        categorySelectElement.disabled = false;
    }
});

// Event listener for category selection
categorySelectElement.addEventListener('change', function () {
    const categoryId = this.value;
    fetchProductsByCategory(categoryId);
});

// Event listener for input changes on the product search field
productSearchElement.addEventListener('input', function () {
    const query = this.value.trim();

    // Fetch product suggestions if the input has at least one character
    if (query.length > 0) {
        fetchProductSuggestions(query);
    } else {
        // Clear suggestions if the query is empty
        suggestionsContainer.innerHTML = '';
    }
});

// When the page loads
window.addEventListener('DOMContentLoaded', function() {
    fetchCategories();
    fetchAndDisplayRequests();
});