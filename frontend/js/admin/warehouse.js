//populate warehouse table for admin
const getWarehouseData = () => {
    // Convert result of querySelectorAll to array otherwise some
    // actions seem to not work, funky business with NodeArray?
    const categoryCheckboxes = [ ...document.querySelectorAll('#warehouse-table-filter-ul input') ]

    let searchParams = new URLSearchParams('')
    let activeCategoryIds

    // If `all` checkbox not selected
    if (!categoryCheckboxes[0].checked) {
        activeCategoryIds = categoryCheckboxes
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.name)

        if (activeCategoryIds.length) {
            searchParams.set('categories', activeCategoryIds)
        } else {
            searchParams.set('no-categories', true)
        }
    }

    fetch('/admin_warehouse_table?' + searchParams.toString())
        .then(response => response.json()) // Parse the response as JSON
        .then(data => {
            let table = document.createElement('table');
            let headerRow = document.createElement('tr');
            let columnNames = [
                'Product',
                'Category',
                'Details',
                'Quantity in house',
                'Quantity in Vehicles'
            ];
            columnNames.forEach(name => {
                let th = document.createElement('th');
                th.textContent = name;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);
            data.forEach(product => {
                let row = document.createElement('tr');

                let cell1 = document.createElement('td');
                let cell2 = document.createElement('td');
                let cell3 = document.createElement('td');
                let cell4 = document.createElement('td');
                let cell5 = document.createElement('td');

                cell1.textContent = product.product_id.name
                row.appendChild(cell1);
                cell2.textContent = product.product_id.category.category_name
                row.appendChild(cell2);
                let detailList = document.createElement('ul');
                product.product_id.details
                    // Only filter to details that are not empty
                    .filter(detail => detail.detail_value || detail.detail_name)
                    .forEach(detail => {
                        let listItem = document.createElement('li');
                        listItem.textContent = detail.detail_name + ': ' + detail.detail_value
                        detailList.appendChild(listItem);
                    });
                if (!detailList.textContent) detailList.textContent = 'N/A'
                cell3.appendChild(detailList);
                row.appendChild(cell3);
                cell4.textContent = product.quantity
                row.appendChild(cell4);
                cell5.textContent = product.vehicle_quantity
                row.appendChild(cell5);

                table.appendChild(row);
            });
            document.getElementById('warehouseTable').innerHTML = '';
            document.getElementById('warehouseTable').appendChild(table);
        })
        .catch(error => console.error('Error:', error));
}
getWarehouseData();
setInterval(getWarehouseData, 5000); // Refresh the table every 5 seconds

//get products data and populate select elements
const pullProductsData = () => {
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

                // Refresh the dropdown lists with products and categories
                pullProductsData();
                pullCategoriesData();
            } else {
                messageElement.style.color = 'red';
            }
            messageElement.textContent = data.message;
        })
        .catch(error => console.error('Error:', error));
});

//populate database with data from json file
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

                        // Refresh the dropdown lists with products and categories
                        pullProductsData();
                        pullCategoriesData();
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
const pullCategoriesData = () => {
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

            // --------For the filter of the warehouse table----------------
            const ul = document.querySelector('#warehouse-table-filter-ul')

            ul.innerHTML = `
                <li>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="all" value="all" id="flexCheckDefault" checked>
                        <label class="form-check-label" for="flexCheckDefault">
                            All
                        </label>
                    </div>
                </li>
                ${
                    data.map(category => `
                        <li>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="${category._id}" value="${category._id}" id="flexCheckDefault" checked>
                                <label class="form-check-label" for="flexCheckDefault">
                                    ${category.category_name}
                                </label>
                            </div>
                        </li>
                    `).join('')
                }
            `

            // Convert result of querySelectorAll to array otherwise some
            // actions seem to not work, funky business with NodeArray?
            const checkboxes = [ ...document.querySelectorAll('#warehouse-table-filter-ul input') ]

            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', e => {
                    const categoryId = e.currentTarget.name;
                    const checked = e.currentTarget.checked;

                    if (categoryId === 'all') {
                        if (checked) {
                            checkboxes.forEach(currentCheckbox => currentCheckbox.checked = true)
                        } else {
                            checkboxes.forEach(currentCheckbox => currentCheckbox.checked = false)
                        }
                    } else {
                        if (!checked) checkboxes[0].checked = false
                    }
                    getWarehouseData()
                })
            })

        })
        .catch(error => console.error('Error:', error));
}

//get products from warehouse and populate select elements
const pullWarehouseData = () => {
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
                pullProductsData();
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

// add details button for create product
document.getElementById('addDetailButton').addEventListener('click', function() {
    const detailsContainer = document.getElementById('detailsContainer');
    if (detailsContainer.children.length >= 10) {
        alert('You can only add up to 10 product details.');
        return;
    }

    const detailDiv = document.createElement('div');
    const index = detailsContainer.children.length;
    detailDiv.classList.add('row', 'mb-3');

    detailDiv.innerHTML = `
        <div class="col-md-5">
            <label for="productDetailName${index}" class="form-label">Detail name (e.g. "volume"):</label>
            <input type="text" id="productDetailName${index}" name="productDetailName[]" 
            class="form-control form-control-sm" placeholder="Type detail name">
        </div>
        <div class="col-md-5">
            <label for="productDetailValue${index}" class="form-label">Detail value (e.g. "500ml"):</label>
            <input type="text" id="productDetailValue${index}" name="productDetailValue[]" 
            class="form-control form-control-sm" placeholder="Type detail value">
        </div>
        <div class="col-md-2 d-flex align-items-end">
            <button type="button" class="btn btn-danger btn-sm removeProductDetailButton w-100">X</button>
        </div>
    `;
    detailsContainer.appendChild(detailDiv);
});

//remove detail button for create product
document.getElementById('detailsContainer').addEventListener('click', function(event) {
    if (event.target.classList.contains('removeProductDetailButton')) {
        event.target.closest('.row').remove();
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
        alert('You can only add up to 10 product details.');
        return;
    }

    const detailDiv = document.createElement('div');
    const index = editProductDetailContainer.children.length;
    detailDiv.classList.add('row', 'mb-3');

    detailDiv.innerHTML = `
        <div class="col-md-5">
            <label for="editProductDetailName${index}" class="form-label">Detail name (e.g. "volume"):</label>
            <input type="text" id="editProductDetailName${index}" name="editProductDetailName[]" 
            class="form-control form-control-sm" placeholder="Type detail name">
        </div>
        <div class="col-md-5">
            <label for="editProductDetailValue${index}" class="form-label">Detail value (e.g. "500ml"):</label>
            <input type="text" id="editProductDetailValue${index}" name="editProductDetailValue[]" 
            class="form-control form-control-sm" placeholder="Type detail value">
        </div>
        <div class="col-md-2 d-flex align-items-end">
            <button type="button" class="btn btn-danger btn-sm removeEditProductDetailButton w-100">X</button>
        </div>
    `;
    editProductDetailContainer.appendChild(detailDiv);
});

//remove detail button for edit product
document.getElementById('editProductDetailContainer').addEventListener('click', function(event) {
    if (event.target.classList.contains('removeEditProductDetailButton')) {
        event.target.closest('.row').remove();
    }
});

//fill form with product details for edit product
document.getElementById('selectEditProduct').addEventListener('change', function() {
    const productId = this.value;
    if (!productId) return;

    fetch(`/product/${productId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('editProductName').value = data.name;
            document.getElementById('editCategoryName').value = data.category;

            const detailsContainer = document.querySelector('.detailsContainer');
            detailsContainer.innerHTML = '';
            data.details.forEach((detail, index) => {
                const detailDiv = document.createElement('div');
                detailDiv.classList.add('row', 'mb-3');

                detailDiv.innerHTML = `
                    <div class="col-md-5">
                        <label for="editProductDetailName${index}" class="form-label">Detail name:</label>
                        <input type="text" id="editProductDetailName${index}" name="editProductDetailName[]" 
                        class="form-control form-control-sm" value="${detail.detail_name}" placeholder="Type detail name">
                    </div>
                    <div class="col-md-5">
                        <label for="editProductDetailValue${index}" class="form-label">Detail value:</label>
                        <input type="text" id="editProductDetailValue${index}" name="editProductDetailValue[]" 
                        class="form-control form-control-sm" value="${detail.detail_value}" placeholder="Type detail value">
                    </div>
                    <div class="col-md-2 d-flex align-items-end">
                        <button type="button" class="btn btn-danger btn-sm removeEditProductDetailButton w-100">X</button>
                    </div>
                `;
                detailsContainer.appendChild(detailDiv);
            });
        })
        .catch(error => console.error('Error:', error));
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

                // Refresh the dropdown lists with updated warehouse product data
                pullWarehouseData();
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

//fill warehouse product quantity in 'Edit Product in Warehouse' when product is selected
document.getElementById('selectEditProductWarehouse').addEventListener('change', function(e) {
    warehouseProducts.forEach(product => {
        if (product.warehouseId === e.target.value) {
            document.getElementById('warehouseEditQuantity').value = product.warehouseQuantity;}
    });
});
