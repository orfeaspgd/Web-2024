// Function to populate the list of products in the cargo of the rescuer's vehicle
function populateVehicleCargo() {
    fetch('/view-vehicle-cargo')
        .then(response => response.json())
        .then(data => {
            const cargoList = document.getElementById('vehicleProducts');
            cargoList.innerHTML = '';

            if (data.length === 0) {
                // If the data is empty, display a message
                const emptyMessage = document.createElement('li');
                emptyMessage.textContent = 'No products loaded in the vehicle.';
                emptyMessage.classList.add('list-group-item', 'text-center'); // Optional classes for styling
                cargoList.appendChild(emptyMessage);
            } else {
                // Otherwise, populate the list with the products
                data.forEach(item => {
                    const listProduct = document.createElement('li');
                    listProduct.textContent = `${item.product} x ${item.quantity}`;
                    listProduct.classList.add('list-group-item');
                    cargoList.appendChild(listProduct);
                });
            }
        });
}

// Function to populate the select element with the list of warehouse products
function populateWarehouseProducts() {
    fetch('/view-warehouse-products')
        .then(response => response.json())
        .then(data => {
            const selectProduct = document.getElementById('selectProduct');
            selectProduct.innerHTML = '';

            // Add the placeholder option back after clearing
            const placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            placeholderOption.disabled = true;
            placeholderOption.selected = true;
            placeholderOption.textContent = 'Pick a product';
            selectProduct.appendChild(placeholderOption);

            // Populate the options with the warehouse products
            data.forEach(item => {
                const productOption = document.createElement('option');
                productOption.textContent = `${item.product} (${item.quantity} units are available)`;
                productOption.value = item.product_id;
                selectProduct.appendChild(productOption);
            });
        })
        .catch(error => {
            console.error('Error fetching warehouse products:', error);
        });
}

// Function to check if the rescuer is within 100 meters of the warehouse
function checkDistanceToWarehouse() {
    fetch('/check-distance-to-warehouse-for-cargo')
        .then(response => response.json())
        .then(data => {
            if (data.withinDistance) {
                // Enable the buttons if the rescuer is within 100 meters of the warehouse
                document.getElementById('loadProductsButton').disabled = false;
                document.getElementById('unloadProductsButton').disabled = false;
            } else {
                // Disable the buttons if the rescuer is not within 100 meters of the warehouse
                document.getElementById('loadProductsButton').disabled = true;
                document.getElementById('unloadProductsButton').disabled = true;
            }
        })
        .catch(error => {
            console.error('Error checking distance to warehouse:', error);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    // Populate the cargo list and warehouse products list when the page loads
    populateVehicleCargo();
    populateWarehouseProducts();

    // Initially check if the rescuer is within 100 meters of the warehouse
    checkDistanceToWarehouse();

    // Regularly check if the rescuer is within 100 meters of the warehouse every 10 seconds
    setInterval(checkDistanceToWarehouse, 10000);
});