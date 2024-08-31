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

        // Add the warehouse marker
        L.marker([data.warehouse.location.latitude, data.warehouse.location.longitude], { icon: warehouseIcon })
            .addTo(map)

        // Add the vehicle markers and popups
        data.vehicles.forEach(vehicle => {
            const vehicleMarker = L.marker([vehicle.rescuer_id.location.latitude, vehicle.rescuer_id.location.longitude], { icon: vehicleIcon })
                .addTo(map);

            // Create the popup content for the vehicle marker using the vehicle data
            vehicleMarker.bindPopup(`
                Name: ${vehicle.name}<br>
                Cargo:<br>${vehicle.cargo.map(item =>
                    `&nbsp;&nbsp;&nbsp;Product: ${item.product_id.name}, Quantity: ${item.quantity}<br>`
                ).join('')}
                Tasks:<br>${vehicle.task_ids.map(task =>
                    `&nbsp;&nbsp;&nbsp;Type: ${task.type}, Status: ${task.status}<br>`
                ).join('')}
            `);
        });
    } catch (err) {
        console.error(err);
    }
}

initializeMap();