const getData = () => {
    fetch('/admin_tasks_table')
        .then(response => response.json()) // Parse the response as JSON
        .then(data => {
            let table = document.createElement('table');
            let headerRow = document.createElement('tr');
            let columnNames = ['Citizen Name', 'Citizen Surname', 'Rescuer Name', 'Rescuer Surname', 'Product Name', 'Product Description', 'Requested Quantity', 'Status', 'Location', 'Task Type'];
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
                let cell10 = document.createElement('td');

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
                cell6.textContent = task.product_id.description;
                row.appendChild(cell6);
                cell7.textContent = task.quantity;
                row.appendChild(cell7);
                cell8.textContent = task.status;
                row.appendChild(cell8);
                cell9.textContent = task.location;
                row.appendChild(cell9);
                cell10.textContent = task.task_type;
                row.appendChild(cell10);

                table.appendChild(row);
            });
            document.getElementById('taskTable').innerHTML = '';
            document.getElementById('taskTable').appendChild(table);
        })
        .catch(error => console.error('Error:', error));
}
getData();
setInterval(getData, 5000); // Refresh the table every 5 seconds