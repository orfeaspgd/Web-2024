// Function to fetch and display requests
async function fetchAndDisplayRequests() {
    try {
        const response = await fetch('/get-requests-by-citizen');
        if (!response.ok) {
            throw new Error('Failed to fetch requests');
        }

        const requests = await response.json();

        const requestsList = document.getElementById('requests');
        requestsList.innerHTML = ''; // Clear existing list

        requests.forEach(request => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');

            // Check if there are no requests
            if (requests.length === 0) {
                const message = document.createElement('li');
                message.classList.add('list-group-item');
                message.textContent = 'You have no requests at this time.';
                requestsList.appendChild(message);
                return;
            }

            // Define a mapping for status codes
            const statusMapping = {
                'pending': 'Pending',
                'in_progress': 'In Progress',
                'completed': 'Completed',
                'cancelled': 'Cancelled'
            };

            // Create request details
            let details = `
                <strong>Product:</strong> ${request.product_id.name} <br>
                <strong>Quantity:</strong> ${request.quantity} <br>
                <strong>Status:</strong> ${statusMapping[request.status]} <br>
                <strong>Created At:</strong> ${new Date(request.createdAt).toLocaleDateString()} <br>
                <strong>Assigned At:</strong> ${request.assignedAt ? new Date(request.assignedAt).toLocaleDateString() : 'N/A'} <br>
                <strong>Completed At:</strong> ${request.completedAt ? new Date(request.completedAt).toLocaleDateString() : 'N/A'}
            `;

            listItem.innerHTML = details;
            requestsList.appendChild(listItem);
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

// When the page loads
window.addEventListener('DOMContentLoaded', function() {
    fetchCategories();
    fetchAndDisplayRequests();
});

// Event listener for category selection
document.getElementById('category').addEventListener('change', function () {
    const categoryId = this.value;
    fetchProductsByCategory(categoryId);
});

// Event listener for input changes on the product search field
document.getElementById('productSearch').addEventListener('input', function () {
    const query = this.value.trim();

    // Fetch product suggestions if the input has at least one character
    if (query.length > 0) {
        fetchProductSuggestions(query);
    } else {
        // Clear suggestions if the query is empty
        suggestionsContainer.innerHTML = '';
    }
});