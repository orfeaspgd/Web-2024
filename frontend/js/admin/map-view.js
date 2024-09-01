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

// Initialize the map with the warehouse location, the vehicles and tasks data
async function initializeMap() {
    try {
        // Fetch the data for the map display
        const response = await fetch('/map-admin-data');
        const data = await response.json();

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
        L.marker([data.warehouse.location.latitude, data.warehouse.location.longitude], { icon: warehouseIcon })
            .addTo(map);

        // Add the vehicle markers and popups
        data.vehicles.forEach(vehicle => {
            const vehicleMarker = L.marker([vehicle.rescuer_id.location.latitude, vehicle.rescuer_id.location.longitude], { icon: vehicleIcon })
                .addTo(map);

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
        });

        // Add the task markers and popups
        data.tasks.forEach(task => {
            let taskMarker;

            if (task.type === 'request') {
                if (task.status === 'in_progress') {
                    taskMarker = L.marker([task.citizen_id.location.latitude, task.citizen_id.location.longitude], { icon: assignedRequestIcon });
                } else {
                    taskMarker = L.marker([task.citizen_id.location.latitude, task.citizen_id.location.longitude], { icon: pendingRequestIcon });
                }
            } else {
                if (task.status === 'in_progress') {
                    taskMarker = L.marker([task.citizen_id.location.latitude, task.citizen_id.location.longitude], { icon: assignedOfferIcon });
                } else {
                    taskMarker = L.marker([task.citizen_id.location.latitude, task.citizen_id.location.longitude], { icon: pendingOfferIcon });
                }
            }

            // Format the assignment date
            const assignmentDate = task.assignedAt ? new Date(task.assignedAt).toLocaleString() : '-';

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
                Assignment Date: ${assignmentDate}<br>
                Vehicle: ${vehicleUsername}
            `);

            // Add task marker to the cluster group
            taskClusters.addLayer(taskMarker);

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
                    }).addTo(map);
                }
            }
        });

        // Add the cluster group to the map
        map.addLayer(taskClusters);
    } catch (err) {
        console.error(err);
    }
}

initializeMap();