document.addEventListener('DOMContentLoaded', function() {
    // Create custom icons for our vehicle/rescuer
    const vehicleIcon = L.icon({
        iconUrl: '../../assets/icons/vehicle.png',
        iconSize: [25, 25]
    });

    // Function to initialize the map with the warehouse location
    function initializeMap(location) {
        // Create the map
        const map = L.map('map').setView([location.latitude, location.longitude], 14);

        // Add the OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add a draggable marker for rescuer location
        let marker = L.marker([location.latitude, location.longitude],
            { icon: vehicleIcon,
                     draggable: true
            }).addTo(map);

        // Update the form fields with the marker's location
        marker.on('moveend', function(event) {
            const { lat, lng } = event.target.getLatLng();
            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lng;
        });
    }

    // Fetch warehouse location
    fetch('/warehouse-location')
        .then(response => response.json())
        .then(location => {
            initializeMap(location);
        })
        .catch(error => console.error('Error fetching warehouse location:', error));

    // Handle form submission for creating a rescuer account by an admin
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

    // Clear form data when the page is refreshed
    window.onbeforeunload = function () {
        document.getElementById('createAccount').reset();
    };
});