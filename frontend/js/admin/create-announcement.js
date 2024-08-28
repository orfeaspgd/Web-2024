//fetch products from the warehouse and populate the dropdown list
const pullWarehouseData = () => {
    fetch('/warehouse_products')
        .then(response => response.json())
        .then(data => {
            warehouseProducts = data;
            const selectProductElements = document.querySelectorAll('.selectProduct');
            selectProductElements.forEach(selectProduct => {
                // Keep the placeholder option
                const placeholder = selectProduct.querySelector('option[value=""]');

                // Clear existing options except for the placeholder
                selectProduct.innerHTML = '';
                if (placeholder) {
                    selectProduct.appendChild(placeholder);
                }

                data.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.warehouseId;
                    option.textContent = product.name;
                    selectProduct.appendChild(option);
                });
            });
        })
        .catch(error => console.error('Error:', error));
}

//when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    pullWarehouseData();
});

//add product to announcement
document.getElementById('addProductButton').addEventListener('click', function() {
    const productsContainer = document.getElementById('productsContainer');
    if (productsContainer.children.length >= 10) {
        alert('You can only add up to 10 products.');
        return;
    }

    const newProductEntry = document.createElement('div');
    newProductEntry.classList.add('productEntry', 'row', 'mb-3');
    const index = productsContainer.children.length;
    newProductEntry.innerHTML =`
        <div class="col d-flex align-items-center">
            <label for="selectProduct${index}" class="form-label me-2">Product:</label>
            <select class="form-select selectProduct me-2" id="selectProduct${index}" name="selectProduct" required>
                <option value="" disabled selected>Pick a product</option>
            </select>
            <button type="button" class="btn btn-danger removeProductButton">Remove</button>
        </div>
    `;
    productsContainer.appendChild(newProductEntry);

    //populate the new select element with the existing warehouseProducts
    const selectProduct = newProductEntry.querySelector('.selectProduct');
    warehouseProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.warehouseId;
        option.textContent = product.name;
        selectProduct.appendChild(option);
    });
});

//add event listener for remove buttons
document.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('removeProductButton')) {
        const productEntry = event.target.closest('.productEntry');
        productEntry.remove();
    }
});

//create announcement
document.getElementById('createAnnouncement').addEventListener('submit', function(event) {
    event.preventDefault();
    let formData = new URLSearchParams(new FormData(this)).toString();
    fetch('/admin_create_announcement', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            let messageElement = document.getElementById('createAnnouncementMessage');
            if (data.status === 'success') {
                messageElement.style.color = 'green';
            } else {
                messageElement.style.color = 'red';
            }
            messageElement.textContent = data.message;
        })
        .catch(error => console.error('Error:', error));
});