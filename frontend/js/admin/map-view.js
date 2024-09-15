window.addEventListener('load', () => {
    // Set all filters to checked by default when the page loads
    document.getElementById('assigned-requests').checked = true;
    document.getElementById('pending-requests').checked = true;
    document.getElementById('assigned-offers').checked = true;
    document.getElementById('pending-offers').checked = true;
    document.getElementById('active-tasks').checked = true;
    document.getElementById('inactive-tasks').checked = true;
    document.getElementById('straight-lines').checked = true;
});

// Create custom icons for our markers
const warehouseIcon = L.icon({
    iconUrl: '../../assets/icons/warehouse.png',
    iconSize: [25, 25]
});

const vehicleIcon = L.icon({
    iconUrl: '../../assets/icons/vehicle.png',
    iconSize: [25, 25]
});

const assignedRequestIcon = L.icon({
    iconUrl: '../../assets/icons/assigned-request.png',
    iconSize: [25, 25]
});

const pendingRequestIcon = L.icon({
    iconUrl: '../../assets/icons/pending-request.png',
    iconSize: [25, 25]
});

const assignedOfferIcon = L.icon({
    iconUrl: '../../assets/icons/assigned-offer.png',
    iconSize: [25, 25]
});

const pendingOfferIcon = L.icon({
    iconUrl: '../../assets/icons/pending-offer.png',
    iconSize: [25, 25]
});

// Fetch the data for the map display
async function fetchMapData() {
    try {
        const data = await fetch('/map-admin-data');
        return await data.json();
    } catch (err) {
        console.error(err);
    }
}

// Update the warehouse location with the new latitude and longitude values
async function updateWarehouseLocation(latitude, longitude) {
    try {
        const response = await fetch('/update-warehouse-location', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latitude, longitude })
        });

        const data = await response.json();
        alert(data.message);
    } catch (err) {
        console.error(err);
    }
}

// Variables to hold the different task layer groups
const assignedRequestsGroup = L.layerGroup();
const pendingRequestsGroup = L.layerGroup();
const assignedOffersGroup = L.layerGroup();
const pendingOffersGroup = L.layerGroup();

// Variables to hold the different vehicle layer groups
const activeTasksVehiclesGroup = L.layerGroup();
const inactiveTasksVehiclesGroup = L.layerGroup();

// Variable to hold the lines layer group
const linesGroup = L.layerGroup();

// Function to handle filter changes for the different task types
function handleTaskFilterChanges(checkboxId, layerGroup, clusterGroup, map) {
    const checkbox = document.getElementById(checkboxId);

    checkbox.addEventListener('change', function () {
        if (this.checked) {
            // Add markers back to both the layer group and the marker cluster group
            layerGroup.eachLayer(marker => {
                clusterGroup.addLayer(marker);
            });
            map.addLayer(layerGroup);

            // Refresh clusters to update their count and display
            clusterGroup.refreshClusters();
        } else {
            // Remove markers from both the layer group and the marker cluster group
            layerGroup.eachLayer(marker => {
                clusterGroup.removeLayer(marker);
            });
            map.removeLayer(layerGroup);

            // Refresh clusters to update their count and display
            clusterGroup.refreshClusters();
        }
    });
}

// Function to handle filter changes for vehicle types (active/inactive) as well as the lines
function handleFilterChanges(checkboxId, layerGroup, map) {
    const checkbox = document.getElementById(checkboxId);

    checkbox.addEventListener('change', function () {
        if (this.checked) {
            // Add layer group to the map
            map.addLayer(layerGroup);
        } else {
            // Remove layer group from the map
            map.removeLayer(layerGroup);
        }
    });
}

// Fetch the data for the map display
fetchMapData().then(data => {

    // Initialize the map
    const map = L.map('map')
        .setView([data.warehouse.location.latitude, data.warehouse.location.longitude], 15);

    // Add the OpenStreetMap tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Create a marker cluster group for the markers
    const taskClusters = L.markerClusterGroup();

    // Add the warehouse marker
    const warehouseMarker = L.marker([data.warehouse.location.latitude, data.warehouse.location.longitude],
        { icon: warehouseIcon,
            draggable: true
        }).addTo(map);

    // Store the original position of the warehouse marker
    let originalLatLng = warehouseMarker.getLatLng();

    // Implement the functionality to update the warehouse location on dragend event of the marker
    warehouseMarker.on('dragend', (event) => {
        const marker = event.target;
        const newPosition = marker.getLatLng();
        const confirmed = confirm('Do you want to update the warehouse location to this new position?');

        if (confirmed) {
            updateWarehouseLocation(newPosition.lat, newPosition.lng);
            // Update the data for next drag
            data.warehouse.location.latitude = newPosition.lat;
            data.warehouse.location.longitude = newPosition.lng;
            originalLatLng = newPosition; // Update original position
        } else {
            // Reset the marker to the original position if not confirmed
            marker.setLatLng(originalLatLng);
        }
    });

    // Add the vehicle markers and popups
    data.vehicles.forEach(vehicle => {
        // Create the vehicle marker
        const vehicleMarker = L.marker([vehicle.rescuer_id.location.latitude, vehicle.rescuer_id.location.longitude], { icon: vehicleIcon});

        // Check if the vehicle has any tasks (regardless of task status)
        const hasActiveTasks = vehicle.task_ids.length > 0;

        // Add the vehicle marker to the appropriate group based on whether it has tasks
        if (hasActiveTasks) {
            activeTasksVehiclesGroup.addLayer(vehicleMarker);
        } else {
            inactiveTasksVehiclesGroup.addLayer(vehicleMarker);
        }

        // Create the popup content for the vehicle marker using the vehicle data
        let cargoContent = '';
        if (vehicle.cargo.length > 0) {
            cargoContent = vehicle.cargo.map(item =>
                `<br>&nbsp;&nbsp;&nbsp;Product: ${item.product_id.name}, Quantity: ${item.quantity}`
            ).join('');
        } else {
            cargoContent = '-';
        }

        vehicleMarker.bindPopup(`
                Name: ${vehicle.name}<br>
                Cargo: ${cargoContent}<br>
                Tasks: ${vehicle.task_ids.length}
            `);

        // Add the vehicle layer groups to the map
        map.addLayer(activeTasksVehiclesGroup);
        map.addLayer(inactiveTasksVehiclesGroup);
    });

    // Add the task markers and popups
    data.tasks.forEach(task => {
        if (task.status === 'completed') {
            return; // Skip completed tasks
        }

        let taskMarker;

        if (task.type === 'request') {
            if (task.status === 'in_progress') {
                taskMarker = L.marker([task.citizen_id.location.latitude, task.citizen_id.location.longitude], { icon: assignedRequestIcon });
                assignedRequestsGroup.addLayer(taskMarker);
            } else {
                taskMarker = L.marker([task.citizen_id.location.latitude, task.citizen_id.location.longitude], { icon: pendingRequestIcon });
                pendingRequestsGroup.addLayer(taskMarker);
            }
        } else {
            if (task.status === 'in_progress') {
                taskMarker = L.marker([task.citizen_id.location.latitude, task.citizen_id.location.longitude], { icon: assignedOfferIcon });
                assignedOffersGroup.addLayer(taskMarker);
            } else {
                taskMarker = L.marker([task.citizen_id.location.latitude, task.citizen_id.location.longitude], { icon: pendingOfferIcon });
                pendingOffersGroup.addLayer(taskMarker);
            }
        }

        // Format the assignment and creation date
        const assignmentDate = task.assignedAt ? new Date(task.assignedAt).toLocaleString() : '-';
        const creationDate = task.createdAt ? new Date(task.createdAt).toLocaleString() : '-';

        // Find the associated vehicle if the task is assigned
        let vehicleUsername = '-';
        if (task.rescuer_id) {
            const vehicle = data.vehicles.find(vehicle => vehicle.rescuer_id._id === task.rescuer_id);
            if (vehicle) {
                vehicleUsername = vehicle.name;
            }
        }

        // Create the popup content for the task marker using the task data
        taskMarker.bindPopup(`
                Name: ${task.citizen_id.name}<br> 
                Surname: ${task.citizen_id.surname}<br>
                Phone: ${task.citizen_id.phone_number}<br>
                Product: ${task.product_id.name}<br>
                Quantity: ${task.quantity}<br>
                Creation Date: ${creationDate}<br>
                Assignment Date: ${assignmentDate}<br>
                Vehicle: ${vehicleUsername}
            `);

        // Add task marker to the cluster group
        taskClusters.addLayer(taskMarker);

        // Add the task cluster group to the map
        map.addLayer(taskClusters);

        // Draw lines from vehicles to assigned tasks
        if (task.rescuer_id) {
            const vehicle = data.vehicles.find(vehicle => vehicle.rescuer_id._id === task.rescuer_id);
            if (vehicle) {
                const line = L.polyline([
                    [task.citizen_id.location.latitude, task.citizen_id.location.longitude],
                    [vehicle.rescuer_id.location.latitude, vehicle.rescuer_id.location.longitude]
                ], {
                    color: 'blue',
                    weight: 2,
                    opacity: 0.6
                }).addTo(linesGroup);
            }

            // Add the lines layer group to the map
            map.addLayer(linesGroup);
        }
    });

    // Apply the filter handlers for the different task types and statuses
    handleTaskFilterChanges('assigned-requests', assignedRequestsGroup, taskClusters, map);
    handleTaskFilterChanges('pending-requests', pendingRequestsGroup, taskClusters, map);
    handleTaskFilterChanges('assigned-offers', assignedOffersGroup, taskClusters, map);
    handleTaskFilterChanges('pending-offers', pendingOffersGroup, taskClusters, map);

    // Apply the filter handlers for the different vehicle types (active/inactive)
    handleFilterChanges('active-tasks', activeTasksVehiclesGroup, map);
    handleFilterChanges('inactive-tasks', inactiveTasksVehiclesGroup, map);

    // Apply the filter handlers for the lines
    handleFilterChanges('straight-lines', linesGroup, map);
});