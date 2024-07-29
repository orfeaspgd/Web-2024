//task table for admin
const getData = () => {
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
getData();
setInterval(getData, 5000); // Refresh the table every 5 seconds

document.addEventListener('DOMContentLoaded', function() {
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
});

//add product to announcement
document.getElementById('addProductButton').addEventListener('click', function() {
    const productsContainer = document.getElementById('productsContainer');
    if (productsContainer.children.length >= 10) {
        alert('You can only add up to 10 products.');
        return;
    }

    const newProductEntry = document.createElement('div');
    newProductEntry.classList.add('productEntry');
    const index = productsContainer.children.length;
    newProductEntry.innerHTML = `
        <label for="selectProduct${index}">Product:</label>
        <select class="selectProduct" id="selectProduct${index}" name="selectProduct[]" required></select>
        <button type="button" class="removeProductButton">Remove</button>
    `;
    productsContainer.appendChild(newProductEntry);

    fetch('/products')
        .then(response => response.json())
        .then(data => {
            const selectProduct = newProductEntry.querySelector('.selectProduct');
            data.forEach(product => {
                const option = document.createElement('option');
                option.value = product._id;
                option.textContent = product.name;
                selectProduct.appendChild(option);
            });
        })
        .catch(error => console.error('Error:', error));
});

//create account
document.getElementById('createAccount').addEventListener('submit', function(event) {
    event.preventDefault();
    let formData = new URLSearchParams(new FormData(this)).toString();
    fetch('/admin_create_account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            let messageElement = document.getElementById('createAccountMessage');
            if (data.status === 'success') {
                messageElement.style.color = 'green';
            } else {
                messageElement.style.color = 'red';
            }
            messageElement.textContent = data.message;
        })
        .catch(error => console.error('Error:', error));
});

//remove products from announcement
document.getElementById('productsContainer').addEventListener('click', function(event) {
    if (event.target.classList.contains('removeProductButton')) {
        event.target.parentElement.remove();
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

//pull from usidas
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
        })
        .catch(error => console.error('Error:', error));
});
