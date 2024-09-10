// Get elements from the DOM for interaction
const categorySelect = document.getElementById('category');
const productSelect = document.getElementById('product');
const productSearch = document.getElementById('productSearch');
const suggestionsContainer = document.getElementById('productSuggestions');

// Function to fetch and display requests
async function fetchAndDisplayRequests() {
    try {
        const response = await fetch('/get-requests-by-citizen');

        const requests = await response.json();

        const requestsContainer  = document.getElementById('requests');
        requestsContainer.innerHTML = ''; // Clear existing list

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
            requestElement.classList.add('col-md-4');

            requestElement.innerHTML = `
                <div class="card">
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

// Function to get products by search term and populate the product dropdown (for search functionality)
async function fetchProductSuggestions(query) {
    try {
        const response = await fetch(`/get-products-by-searching/${query}/${categorySelect.value}`);
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
                    productSearch.value = product.name;
                    // Store the product ID as a data attribute
                    productSearch.dataset.productId = product._id;
                    suggestionsContainer.innerHTML = '';
                });

                suggestionsContainer.appendChild(suggestion);
            });
        }
    } catch (error) {
        console.error('Error fetching product suggestions:', error);
    }
}

// Function to create a new request
async function createRequest(product_id, peopleCount) {
    try {
        const response = await fetch('/create-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ product_id, peopleCount })
        });

        const data = await response.json();

        if (response.ok) {
            fetchAndDisplayRequests(); // Refresh the requests list
            return { success: true, message: 'Request created successfully.' };
        } else {
            return { success: false, message: data.message || 'Failed to create request.' };
        }
    } catch (error) {
        console.error('Error creating request:', error);
    }
}

// Disable autocomplete search if a product is selected from the dropdown
productSelect.addEventListener('change', () => {
    productSearch.disabled = true;
    productSearch.value = '';
    suggestionsContainer.innerHTML = '';
});

// Disable the product dropdown and category selection if a product is searched for
productSearch.addEventListener('input', () => {
    if (productSearch.value.trim().length > 0) {
        productSelect.disabled = true;
        categorySelect.disabled = true;
    } else {
        productSelect.disabled = false;
        categorySelect.disabled = false;
    }
});

// Event listener for category selection
categorySelect.addEventListener('change', function () {
    const categoryId = this.value;
    fetchProductsByCategory(categoryId);
});

// Event listener for input changes on the product search field
productSearch.addEventListener('input', function () {
    const query = this.value.trim();

    // Fetch product suggestions if the input has at least two characters
    if (query.length > 1) {
        fetchProductSuggestions(query);
    } else {
        // Clear suggestions if the query is empty
        suggestionsContainer.innerHTML = '';
    }
});

// Event listener for form submission (request creation)
document.getElementById('createRequest').addEventListener('submit', async function(event) {
    event.preventDefault();

    let selectedProduct;

    // Check if a product was selected from the dropdown or typed in the autocomplete field
    const peopleCountInput = document.getElementById('peopleCount').value;
    const responseMessageDiv = document.getElementById('responseMessage');

    if (!productSearch.disabled && productSearch.dataset.productId) {
        // Use the selected product ID from the suggestion
        selectedProduct = productSearch.dataset.productId;
    } else {
        // Use the selected product ID from the dropdown
        selectedProduct = productSelect.options[productSelect.selectedIndex].value;
    }

    // Ensure a product is selected and people count is valid
    if (selectedProduct && peopleCountInput) {
        // Call the createRequest function
        const result = await createRequest(selectedProduct, peopleCountInput);

        // Display the result
        if (result.success) {
            responseMessageDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
        } else {
            responseMessageDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }

        // Clear the message after 3 seconds
        setTimeout(() => {
            responseMessageDiv.innerHTML = '';
        }, 3000);
    } else {
        alert('Please select a product and specify the number of people.');
    }
});

// When the page loads
window.addEventListener('DOMContentLoaded', function() {
    // Clear the product search field and suggestions
    productSearch.value = '';
    suggestionsContainer.innerHTML = '';

    // Set the people count to 1 when the page loads
    document.getElementById('peopleCount').value = '1';

    // Fetch categories and requests
    fetchCategories();
    fetchAndDisplayRequests();
});