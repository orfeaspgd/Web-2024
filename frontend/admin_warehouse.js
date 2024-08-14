pullProductsData = () => {
    fetch('/products')
    .then(response => response.json())
        .then(data => {
            const selectProductElements = document.querySelectorAll('.selectProduct');
            selectProductElements.forEach(selectProduct => {
                data.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product._id;
                    option.textContent = product.name;
                    selectProduct.appendChild(option);
                });
            });
        })
        .catch(error => console.error('Error:', error));
}

pullCategoriesData = () => {
    fetch('/categories')
        .then(response => response.json())
        .then(data => {
            const selectCategoryElements = document.querySelectorAll('.selectCategory');
            selectCategoryElements.forEach(selectCategory => {
                data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category._id;
                    option.textContent = category.category_name;
                    selectCategory.appendChild(option);
                });
            });
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    pullProductsData();
    pullCategoriesData();

    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', function() {
        window.location.href = '/home';
    });
});

document.getElementById('deleteProduct').addEventListener('submit', function(event) {
    fetch('/delete_product', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ _id: document.getElementById('selectProduct0').value })
    })
        .then(response => response.json())
        .then(data => {
            let messageElement = document.getElementById('deleteProductMessage');
            if (data.status === 'success') {
                messageElement.style.color = 'green';
            } else {
                messageElement.style.color = 'red';
            }
            messageElement.textContent = data.message;
        })
        .catch(error => console.error('Error:', error));
});

document.getElementById('deleteCategory').addEventListener('submit', function(event) {
    fetch('/delete_category', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ _id: document.getElementById('selectCategory0').value })
    })
        .then(response => response.json())
        .then(data => {
            let messageElement = document.getElementById('deleteCategoryMessage');
            if (data.status === 'success') {
                messageElement.style.color = 'green';
            } else {
                messageElement.style.color = 'red';
            }
            messageElement.textContent = data.message;
        })
        .catch(error => console.error('Error:', error));
});