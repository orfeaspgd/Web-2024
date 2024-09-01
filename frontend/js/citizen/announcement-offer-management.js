//get announcements data
const getAnnouncementsData = () => {
    fetch('/citizen_announcements_table')
        .then(response => response.json()) // Parse the response as JSON
        .then(data => {
            let table = document.createElement('table');
            let headerRow = document.createElement('tr');
            let columnNames = ['ID', 'Products Needed', 'Created By', 'Created At'];
            columnNames.forEach(name => {
                let th = document.createElement('th');
                th.textContent = name;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);
            data.forEach(announcement => {
                console.log(announcement);
                let row = document.createElement('tr');

                let cell1 = document.createElement('td');
                let cell2 = document.createElement('td');
                let cell3 = document.createElement('td');
                let cell4 = document.createElement('td');
                let cell5 = document.createElement('td');

                cell1.textContent = announcement._id;
                row.appendChild(cell1);
                let productList = document.createElement('ul');
                announcement.products.forEach(product => {
                    let listItem = document.createElement('li');
                    listItem.textContent = product.name;
                    productList.appendChild(listItem);
                });
                cell2.appendChild(productList);
                row.appendChild(cell2);
                cell3.textContent = announcement.admin_id.name;
                row.appendChild(cell3);
                cell4.textContent = announcement.createdAt;
                row.appendChild(cell4);
                cell5.innerHTML = `
                    <button data-bs-toggle="modal" data-bs-target="#exampleModal" class="btn btn-primary mt-1 ">Create Offer</button>
                `
                row.appendChild(cell5);

                cell5.querySelector('button').addEventListener('click', () => {
                    document.getElementById('modal-form-div').innerHTML = `
                        <p>Create Offers for the following products</p>

                        <div class="row mb-1">
                            <div class="col-12">
                            <input name="type" value="offer" type="hidden">
                        ${
                            announcement.products.map(product => {
                                return `
                                    <input name="products[]" type="hidden" value="${product._id}">
                                    <label class="form-check-label">${product.name}:</label>
                                    <input name="productQuantities[]" class="form-control" type="number" value="0" id="${product._id}-quantity">
                                `
                            }).join('<br>')
                        }
                            </div>
                        </div>
                    `
                })

                table.appendChild(row);
            });
            document.getElementById('announcementsTable').innerHTML = '';
            document.getElementById('announcementsTable').appendChild(table);
        })
        .catch(error => console.error('Error:', error));
}
getAnnouncementsData();
setInterval(getAnnouncementsData, 5000); //refresh table every 5 seconds


//get announcements data
const getOffersData = () => {
    fetch('/citizen_offers_table')
        .then(response => response.json()) // Parse the response as JSON
        .then(data => {
            let table = document.createElement('table');
            let headerRow = document.createElement('tr');
            let columnNames = [
                'ID',
                'Products Offered',
                'Quantity',
                'Created At',
                'Status',
                'Assigned At',
                'Completed At'
            ];
            columnNames.forEach(name => {
                let th = document.createElement('th');
                th.textContent = name;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);
            data.forEach(offer => {
                let row = document.createElement('tr');

                let cell1 = document.createElement('td');
                let cell2 = document.createElement('td');
                let cell3 = document.createElement('td');
                let cell4 = document.createElement('td');
                let cell5 = document.createElement('td');
                let cell6 = document.createElement('td');
                let cell7 = document.createElement('td');
                let cell8 = document.createElement('td');

                cell1.textContent = offer._id;
                row.appendChild(cell1);
                let productList = document.createElement('ul');
                cell2.textContent = offer.product_id.name
                cell2.appendChild(productList);
                row.appendChild(cell2);
                cell3.textContent = offer.quantity;
                row.appendChild(cell3);
                cell4.textContent = offer.createdAt;
                row.appendChild(cell4);
                let color = ''
                switch (offer.status) {
                    case 'cancelled':
                        color = 'danger'
                        break
                    case 'pending':
                        color = 'warning'
                        break
                    case 'completed':
                        color = 'success'
                        break
                    case 'in_progress':
                        color = 'primary'
                        break
                }
                cell5.innerHTML = `<div><span class="badge text-bg-${color}">${offer.status}</span></div>`
                row.appendChild(cell5);
                cell6.textContent = offer.assignedAt;
                row.appendChild(cell6);
                cell7.textContent = offer.completedAt;
                row.appendChild(cell7);
                if (offer.status !== 'cancelled') {
                    cell8.innerHTML = `
                        <button class="btn btn-danger mt-1">Cancel</button>
                        <div class="msg"></div>
                    `
                }
                row.appendChild(cell8);

                cell8.querySelector('button')?.addEventListener('click', () => {
                    let formData = new URLSearchParams({
                        task: offer._id
                    }).toString();

                    fetch('/citizen_cancel_task', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: formData
                    })
                        .then(response => response.json())
                        .then(data => {
                            let messageElement = cell8.querySelector('.msg');
                            if (data.status === 'success') {
                                messageElement.style.color = 'green';
                                getOffersData();
                            } else {
                                messageElement.style.color = 'red';
                            }
                            messageElement.textContent = data.message;
                        })
                        .catch(error => console.error('Error:', error));
                })

                table.appendChild(row);
            });
            document.getElementById('offersTable').innerHTML = '';
            document.getElementById('offersTable').appendChild(table);
        })
        .catch(error => console.error('Error:', error));
}
getOffersData();
setInterval(getOffersData, 5000); //refresh table every 5 seconds

document.getElementById('modal-form').addEventListener('submit', function(event) {
    event.preventDefault();

    let formData = new URLSearchParams(new FormData(this)).toString();

    fetch('/citizen_create_tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            let messageElement = document.querySelector('#form-msg');
            if (data.status === 'success') {
                messageElement.textContent = '';
                // Simulate click on modal cancel button to close the modal
                document.querySelector('#cancel-modal').click()
                getOffersData()
            } else {
                messageElement.style.color = 'red';
                messageElement.textContent = data.message;
            }
        })
        .catch(error => console.error('Error:', error));

})
