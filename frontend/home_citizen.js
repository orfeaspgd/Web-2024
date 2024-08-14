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

const getAnnouncementsData = () => {
    fetch('/citizen_announcements_table')
        .then(response => response.json()) // Parse the response as JSON
        .then(data => {
            let table = document.createElement('table');
            let headerRow = document.createElement('tr');
            let columnNames = ['ID', 'Product Needed', 'Created By', 'Created At'];
            columnNames.forEach(name => {
                let th = document.createElement('th');
                th.textContent = name;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);
            data.forEach(announcement => {
                let row = document.createElement('tr');

                let cell1 = document.createElement('td');
                let cell2 = document.createElement('td');
                let cell3 = document.createElement('td');
                let cell4 = document.createElement('td');

                cell1.textContent = announcement._id;
                row.appendChild(cell1);
                cell2.textContent = announcement.products.name;
                row.appendChild(cell2);
                cell3.textContent = announcement.admin_id.name;
                row.appendChild(cell3);
                cell4.textContent = announcement.createdAt;
                row.appendChild(cell4);

                table.appendChild(row);
            });
            document.getElementById('announcementsTable').innerHTML = '';
            document.getElementById('announcementsTable').appendChild(table);
        })
        .catch(error => console.error('Error:', error));
}
getAnnouncementsData();
setInterval(getAnnouncementsData, 5000); // Refresh the table every 5 seconds