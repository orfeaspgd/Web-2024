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

// When the page loads
window.addEventListener('DOMContentLoaded', fetchCategories);