//populate task table for admin
const getTasksData = () => {
    fetch('/admin_tasks_table')
        .then(response => response.json()) // Parse the response as JSON
        .then(data => {
            let table = document.createElement('table');
            let headerRow = document.createElement('tr');
            let columnNames = ['Citizen Name', 'Citizen Surname', 'Rescuer Name', 'Rescuer Surname', 'Product Name', 'Requested Quantity', 'Status', 'Type', 'Location'];
            columnNames.forEach(name => {
                let th = document.createElement('th');
                th.textContent = name;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);
            data.forEach(task => {
                let row = document.createElement('tr');

                let cell1 = document.createElement('td');
                let cell2 = document.createElement('td');
                let cell3 = document.createElement('td');
                let cell4 = document.createElement('td');
                let cell5 = document.createElement('td');
                let cell6 = document.createElement('td');
                let cell7 = document.createElement('td');
                let cell8 = document.createElement('td');
                let cell9 = document.createElement('td');

                cell1.textContent = task.citizen_id.name;
                row.appendChild(cell1);
                cell2.textContent = task.citizen_id.surname;
                row.appendChild(cell2);
                cell3.textContent = task.rescuer_id.name;
                row.appendChild(cell3);
                cell4.textContent = task.rescuer_id.surname;
                row.appendChild(cell4);
                cell5.textContent = task.product_id.name;
                row.appendChild(cell5);
                cell6.textContent = task.quantity;
                row.appendChild(cell6);
                cell7.textContent = task.status;
                row.appendChild(cell7);
                cell8.textContent = task.type;
                row.appendChild(cell8);
                cell9.textContent = task.citizen_id.location;
                row.appendChild(cell9);

                table.appendChild(row);
            });
            document.getElementById('taskTable').innerHTML = '';
            document.getElementById('taskTable').appendChild(table);
        })
        .catch(error => console.error('Error:', error));
}
getTasksData();
setInterval(getTasksData, 5000); // Refresh the table every 5 seconds

//get products data and populate select elements
pullProductsData = () => {
    fetch('/products')
        .then(response => response.json())
        .then(data => {
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
                    option.value = product._id;
                    option.textContent = product.name;
                    selectProduct.appendChild(option);
                });
            });
        })
        .catch(error => console.error('Error:', error));
}

//logout
document.getElementById('logoutButton').addEventListener('click', function() {
    fetch('/logout', {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                window.location.href = data.redirectUrl;
            }
        })
        .catch(error => console.error('Error:', error));
});

//populate database with data from usidas
document.getElementById('pullFromUsidas').addEventListener('click', function() {
    fetch('/pull_from_usidas', {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            let messageElement = document.getElementById('pullFromUsidasMessage');
            if (data.status === 'success') {
                messageElement.style.color = 'green';
            } else {
                messageElement.style.color = 'red';
            }
            messageElement.textContent = data.message;
            pullProductsData();
        })
        .catch(error => console.error('Error:', error));
});

//populated database with json file
document.getElementById('addProductsFromJson').addEventListener('change', async function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const fileContents = e.target.result;
            await fetch('/add_products_from_json', {
                method: 'POST'
                , headers: {
                    'Content-Type': 'application/json'
                }
                , body: JSON.stringify({
                    fileContents: fileContents
                })
            })
                .then(response => response.json())
                .then(data => {
                    let messageElement = document.getElementById('addProductsFromJsonMessage');
                    if (data.status === 'success') {
                        messageElement.style.color = 'green';
                    } else {
                        messageElement.style.color = 'red';
                    }
                    messageElement.textContent = data.message;
                    pullProductsData();
                })
                .catch(error => console.error('Error:', error));
        };
        reader.readAsText(file);
    }
});

//global variables
let warehouseProducts = [];

//get categories and populate select elements
pullCategoriesData = () => {
    fetch('/categories')
        .then(response => response.json())
        .then(data => {
            const selectCategoryElements = document.querySelectorAll('.selectCategory');
            selectCategoryElements.forEach(selectCategory => {
                // Keep the placeholder option
                const placeholder = selectCategory.querySelector('option[value=""]');

                // Clear existing options except for the placeholder
                selectCategory.innerHTML = '';
                if (placeholder) {
                    selectCategory.appendChild(placeholder);
                }
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

//get products from warehouse and populate select elements
pullWarehouseData = () => {
    fetch('/warehouse_products')
        .then(response => response.json())
        .then(data => {
            warehouseProducts = data;
            const selectProductWarehouseElements = document.querySelectorAll('.selectProductWarehouse');
            selectProductWarehouseElements.forEach(selectProductWarehouse => {
                // Keep the placeholder option
                const placeholder = selectProductWarehouse.querySelector('option[value=""]');

                // Clear existing options except for the placeholder
                selectProductWarehouse.innerHTML = '';
                if (placeholder) {
                    selectProductWarehouse.appendChild(placeholder);
                }

                data.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.warehouseId;
                    option.textContent = product.name;
                    selectProductWarehouse.appendChild(option);
                });
            });
        })
        .catch(error => console.error('Error:', error));
}

//things to do when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    pullProductsData();
    pullCategoriesData();
    pullWarehouseData();
});

//delete product
document.getElementById('deleteProduct').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the default form submission behavior

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

                // Refresh the dropdown list after deletion
                pullProductsData();
            } else {
                messageElement.style.color = 'red';
            }
            messageElement.textContent = data.message;
        })
        .catch(error => console.error('Error:', error));
});

//delete category
document.getElementById('deleteCategory').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the default form submission behavior

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

                // Refresh the dropdown list after deletion
                pullCategoriesData();
            } else {
                messageElement.style.color = 'red';
            }
            messageElement.textContent = data.message;
        })
        .catch(error => console.error('Error:', error));
});

//create product
document.getElementById('createProduct').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the default form submission behavior

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

                // Refresh the dropdown list after creation
                pullProductsData();
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
    event.preventDefault(); // Prevent the default form submission

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

                // Refresh the category dropdown lists after successful category creation
                pullCategoriesData();
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
            document.getElementById('selectCategoryEditProduct0').value = data.category;

            const detailsContainer = document.querySelector('.detailsContainer');
            detailsContainer.innerHTML = '';
            console.log(data.details);
            data.details.forEach((detail, index) => {
                const detailDiv = document.createElement('div');
                detailDiv.innerHTML = `
                <div class="input-container" id="">
                    <div>
                        <label for="editProductDetailName${index}">Item detail name:</label>
                        <input type="text" id="editProductDetailName${index}" name="editProductDetailName[]" value="${detail.detail_name}">
                    </div>
                    <div>
                        <label for="editProductDetailValue${index}">Item detail value:</label>
                        <input type="text" id="editProductDetailValue${index}" name="editProductDetailValue[]" value="${detail.detail_value}">
                    </div>
                    </div>
                        <button type="button" class="removeEditProductDetailButton">Remove</button>
                    </div>
                </div>
                `;
                detailsContainer.appendChild(detailDiv);
            });
        })
        .catch(error => console.error('Error:', error));
});

//edit product
document.getElementById('editProduct').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the default form submission behavior

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

                // Refresh the category dropdown lists after successful product edit
                pullProductsData();
            } else {
                messageElement.style.color = 'red';
            }
            messageElement.textContent = data.message;
        })
        .catch(error => console.error('Error:', error));
});

//add details button for edit product
document.getElementById('editProductAddDetailButton').addEventListener('click', function() {
    const editProductDetailContainer = document.getElementById('editProductDetailContainer');
    if (editProductDetailContainer.children.length >= 10) {
        alert('You can only add up to 10 products.');
        return;
    }

    const detailDiv = document.createElement('div');
    const index = editProductDetailContainer.children.length;
    detailDiv.innerHTML = `
                <div class="input-container" >
                    <div>
                        <label for="editProductDetailName${index}">Item detail name:</label>
                        <input type="text" id="editProductDetailName${index}" name="editProductDetailName[]"">
                    </div>
                    <div>
                        <label for="editProductDetailValue${index}">Item detail value:</label>
                        <input type="text" id="editProductDetailValue${index}" name="editProductDetailValue[]"">
                    </div>
                        <button type="button" class="removeEditProductDetailButton">Remove</button>
                </div>
            `;
    editProductDetailContainer.appendChild(detailDiv);
});

//remove detail button for edit product
document.getElementById('editProductDetailContainer').addEventListener('click', function(event) {
    if (event.target.classList.contains('removeEditProductDetailButton')) {
        event.target.parentElement.remove();
    }
});

//add product in the warehouse
document.getElementById('addProductWarehouse').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the default form submission behavior

    let formData = new URLSearchParams(new FormData(this)).toString();
    fetch('/add_product_warehouse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            let messageElement = document.getElementById('addProductWarehouseMessage');
            if (data.status === 'success') {
                messageElement.style.color = 'green';
            } else {
                messageElement.style.color = 'red';
            }
            messageElement.textContent = data.message;
        })
        .catch(error => console.error('Error:', error));
});

//edit product in the warehouse
document.getElementById('editProductWarehouse').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the default form submission behavior

    let formData = new URLSearchParams(new FormData(this)).toString();
    fetch('/edit_product_warehouse', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            let messageElement = document.getElementById('editProductWarehouseMessage');
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
document.getElementById('selectEditProductWarehouse0').addEventListener('change', function(e) {
    warehouseProducts.forEach(product => {
        if (product.warehouseId === e.target.value) {
            document.getElementById('warehouseEditQuantity').value = product.warehouseQuantity;}
    });
});
