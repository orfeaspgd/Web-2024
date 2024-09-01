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
                    <button class="btn btn-primary mt-1">Create Offer</button>
                    <div class="msg"></div>
                `
                row.appendChild(cell5);

                cell5.querySelector('button').addEventListener('click', () => {
                    let formData = new URLSearchParams({
                        announcement: announcement._id
                    }).toString();

                    fetch('/citizen_create_offer', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: formData
                    })
                        .then(response => response.json())
                        .then(data => {
                            let messageElement = cell5.querySelector('.msg');
                            if (data.status === 'success') {
                                messageElement.style.color = 'green';
                                getOffersData()
                            } else {
                                messageElement.style.color = 'red';
                            }
                            messageElement.textContent = data.message;
                        })
                        .catch(error => console.error('Error:', error));
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
                'Created At',
                'Status',
                'Taken At',
                'Completed At'
            ];
            columnNames.forEach(name => {
                let th = document.createElement('th');
                th.textContent = name;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);
            data.forEach(offer => {
                console.log(offer);
                let row = document.createElement('tr');

                let cell1 = document.createElement('td');
                let cell2 = document.createElement('td');
                let cell3 = document.createElement('td');
                let cell4 = document.createElement('td');
                let cell5 = document.createElement('td');
                let cell6 = document.createElement('td');
                let cell7 = document.createElement('td');

                cell1.textContent = offer._id;
                row.appendChild(cell1);
                let productList = document.createElement('ul');
                offer.products.forEach(product => {
                    let listItem = document.createElement('li');
                    listItem.textContent = product.name;
                    productList.appendChild(listItem);
                });
                cell2.appendChild(productList);
                row.appendChild(cell2);
                cell3.textContent = offer.createdAt;
                row.appendChild(cell3);
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
                    case 'taken':
                        color = 'primary'
                        break
                }
                cell4.innerHTML = `<div><span class="badge text-bg-${color}">${offer.status}</span></div>`
                row.appendChild(cell4);
                cell5.textContent = offer.takenAt;
                row.appendChild(cell5);
                cell6.textContent = offer.completedAt;
                row.appendChild(cell6);
                if (offer.status !== 'cancelled') {
                    cell7.innerHTML = `
                        <button class="btn btn-danger mt-1">Cancel</button>
                        <div class="msg"></div>
                    `
                }
                row.appendChild(cell7);

                cell7.querySelector('button')?.addEventListener('click', () => {
                    let formData = new URLSearchParams({
                        offer: offer._id
                    }).toString();

                    fetch('/citizen_cancel_offer', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: formData
                    })
                        .then(response => response.json())
                        .then(data => {
                            let messageElement = cell7.querySelector('.msg');
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
