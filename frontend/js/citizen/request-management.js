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
window.addEventListener('DOMContentLoaded', fetchCategories);

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