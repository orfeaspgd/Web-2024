//get products and populate select elements
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
            const selectEditProduct = document.querySelectorAll('.selectEditProduct');
            selectEditProduct.forEach(selectEditProduct => {
                data.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product._id;
                    option.textContent = product.name;
                    selectEditProduct.appendChild(option);
                });
            });
        })
        .catch(error => console.error('Error:', error));
}

//get categories and populate select elements
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
            const selectCategoryEditProduct = document.querySelectorAll('.selectCategoryEditProduct');
            selectCategoryEditProduct.forEach(selectCategoryEditProduct => {
                data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category._id;
                    option.textContent = category.category_name;
                    selectCategoryEditProduct.appendChild(option);
                });
            });
        })
        .catch(error => console.error('Error:', error));
}

//things to do when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    pullProductsData();
    pullCategoriesData();

    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', function() {
        window.location.href = '/home';
    });
});

//delete product
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

//delete category
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

//create product
document.getElementById('createProduct').addEventListener('submit', function(event) {
    let formData = new URLSearchParams(new FormData(this)).toString();
    fetch('/create_product', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            let messageElement = document.getElementById('createProductMessage');
            if (data.status === 'success') {
                messageElement.style.color = 'green';
            } else {
                messageElement.style.color = 'red';
            }
            messageElement.textContent = data.message;
        })
        .catch(error => console.error('Error:', error));
});

//add details button for create product
document.getElementById('addDetailButton').addEventListener('click', function() {
    const detailsContainer = document.getElementById('detailsContainer');
    if (detailsContainer.children.length >= 10) {
        alert('You can only add up to 10 products.');
        return;
    }

    const detailDiv = document.createElement('div');
    const index = detailsContainer.children.length;
    detailDiv.innerHTML = `
                <div class="input-container">
                <div>
                    <label for="productDetailName${index}">Item detail name (e.g. "volume"):</label>
                    <input type="text" id="productDetailName${index}" name="productDetailName[]">
                </div>
                <div>
                    <label for="productDetailValue${index}">Item detail value (e.g. "500ml"):</label>
                    <input type="text" id="productDetailValue${index}" name="productDetailValue[]">
                </div>
                        <button type="button" class="removeProductDetailButton">Remove</button>
                </div>
            `;
    detailsContainer.appendChild(detailDiv);
});

//remove detail button for create product
document.getElementById('detailsContainer').addEventListener('click', function(event) {
    if (event.target.classList.contains('removeProductDetailButton')) {
        event.target.parentElement.remove();
    }
});

//create category
document.getElementById('createCategory').addEventListener('submit', function(event) {
    let formData = new URLSearchParams(new FormData(this)).toString();
    fetch('/create_category', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            let messageElement = document.getElementById('createCategoryMessage');
            if (data.status === 'success') {
                messageElement.style.color = 'green';
            } else {
                messageElement.style.color = 'red';
            }
            messageElement.textContent = data.message;
        })
        .catch(error => console.error('Error:', error));
});

//edit product
document.getElementById('editProduct').addEventListener('submit', function(event) {
    let formData = new URLSearchParams(new FormData(this)).toString();
    fetch('/edit_product', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            let messageElement = document.getElementById('editProductMessage');
            if (data.status === 'success') {
                messageElement.style.color = 'green';
            } else {
                messageElement.style.color = 'red';
            }
            messageElement.textContent = data.message;
        })
        .catch(error => console.error('Error:', error));
});

//fill form with product details for edit product
document.getElementById('selectEditProduct0').addEventListener('change', function() {
    const productId = this.value;
    if (!productId) return;

    fetch(`/product/${productId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('editProductName').value = data.name;
            document.getElementById('selectCategoryEditProduct0').value = data.categoryId;

            // Clear existing details
            const detailsContainer = document.querySelector('#editProduct .input-container');
            detailsContainer.innerHTML = '';

            // Populate details
            data.details.forEach((detail, index) => {
                const detailDiv = document.createElement('div');
                detailDiv.innerHTML = `
                    <div>
                        <label for="editProductDetailName${index}">Item detail name:</label>
                        <input type="text" id="editProductDetailName${index}" name="editProductDetailName[]" value="${detail.name}">
                    </div>
                    <div>
                        <label for="editProductDetailValue${index}">Item detail value:</label>
                        <input type="text" id="editProductDetailValue${index}" name="editProductDetailValue[]" value="${detail.value}">
                    </div>
                `;
                detailsContainer.appendChild(detailDiv);
            });
        })
        .catch(error => console.error('Error:', error));
});