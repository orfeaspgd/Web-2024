document.addEventListener('DOMContentLoaded', function() {
    let map;
    let marker;

    // Function to initialize the map with the warehouse location
    function initializeMap(location) {
        // Create the map
        map = L.map('map').setView([location.latitude, location.longitude], 14);

        // Add the OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add a draggable marker for citizen location
        marker = L.marker([location.latitude, location.longitude], {draggable: true})
            .addTo(map);

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
            document.getElementById('latitude').value = location.latitude;
            document.getElementById('longitude').value = location.longitude;
            initializeMap(location);
        })
        .catch(error => console.error('Error fetching warehouse location:', error));

    // Use current location button
    document.getElementById('useCurrentLocation').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                // Get current location
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // Move the map to the current location and update the marker
                map.setView([lat, lng], 14);
                marker.setLatLng([lat, lng]);

                // Update hidden form fields with the new coordinates
                document.getElementById('latitude').value = lat;
                document.getElementById('longitude').value = lng;
            }, function() {
                alert('Could not get current location.');
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    });

    // Handle form submission for creating a citizen account
    document.getElementById('createAccount').addEventListener('submit', function(event) {
        event.preventDefault();
        let formData = new URLSearchParams(new FormData(this)).toString();
        fetch('/login_create_account', {
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