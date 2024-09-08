///////////////////////////////////////////////////////////////////////////////////
// Map View Section
///////////////////////////////////////////////////////////////////////////////////

window.addEventListener('load', () => {
    // Set all filters to checked by default when the page loads
    document.getElementById('assigned-requests').checked = true;
    document.getElementById('pending-requests').checked = true;
    document.getElementById('assigned-offers').checked = true;
    document.getElementById('pending-offers').checked = true;
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
        const data = await fetch('/map-rescuer-data');
        return await data.json();
    } catch (err) {
        console.error(err);
    }
}

// Update the rescuer's location with the new latitude and longitude values
async function updateRescuerLocation(latitude, longitude) {
    try {
        const response = await fetch('/update-rescuer-location', {
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

// Variable to hold the lines layer group
const linesGroup = L.layerGroup();

// Function to draw lines from the rescuer's vehicle to assigned tasks
function drawLines(data, layerGroup, rescuerLatLng, map) {
    // Clear existing lines before drawing new ones
    linesGroup.clearLayers();

    // Draw lines from rescuer's vehicle to its assigned tasks
    data.tasks.forEach(task => {
        if (task.rescuer_id) {
            const line = L.polyline([
                [task.citizen_id.location.latitude, task.citizen_id.location.longitude],
                [rescuerLatLng.lat, rescuerLatLng.lng]
            ], {
                color: 'blue',
                weight: 2,
                opacity: 0.6
            }).addTo(linesGroup);
        }
    });

    // Add the lines layer group to the map
    map.addLayer(linesGroup);
}

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

// Function to claim a task
async function claimTask(taskId) {
    try {
        const response = await fetch('/claim-task', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ taskId })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Task claimed successfully!');
            window.location.reload();  // Reload the page to update the map
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error claiming task:', error);
        alert('Failed to claim the task. Please try again.');
    }
}

// Fetch the data for the map display
fetchMapData().then(data => {

    // Initialize the map
    const map = L.map('map')
        .setView([data.vehicle.rescuer_id.location.latitude, data.vehicle.rescuer_id.location.longitude], 15);

    // Add the OpenStreetMap tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Create a marker cluster group for the markers
    const taskClusters = L.markerClusterGroup();

    // Add the rescuer's marker to the map
    const rescuerMarker = L.marker([data.vehicle.rescuer_id.location.latitude, data.vehicle.rescuer_id.location.longitude],
        { icon: vehicleIcon, draggable: true }).addTo(map);

    // Store the original position of the rescuer marker
    let originalLatLng = rescuerMarker.getLatLng();

    // Implement the functionality to update the rescuer's location on dragend event of the marker
    rescuerMarker.on('dragend', (event) => {
        const marker = event.target;
        const newPosition = marker.getLatLng();
        const confirmed = confirm('Do you want to update your location to this new position?');

        if (confirmed) {
            updateRescuerLocation(newPosition.lat, newPosition.lng);
            // Update the data for next drag
            data.vehicle.rescuer_id.location.latitude = newPosition.lat;
            data.vehicle.rescuer_id.location.longitude = newPosition.lng;
            originalLatLng = newPosition; // Update original position

            drawLines(data, linesGroup, newPosition, map);
        } else {
            // Reset the marker to the original position if not confirmed
            marker.setLatLng(originalLatLng);
        }
    });

    // Add the warehouse marker
    const warehouseMarker = L.marker([data.warehouse.location.latitude, data.warehouse.location.longitude],
        { icon: warehouseIcon }).addTo(map);

    // Add the task markers and popups
    data.tasks.forEach(task => {
        let taskMarker;

        if (task.type === 'request') {
            if (task.status === 'in_progress') {
                taskMarker = L.marker([task.citizen_id.location.latitude, task.citizen_id.location.longitude], {icon: assignedRequestIcon});
                assignedRequestsGroup.addLayer(taskMarker);
            } else {
                taskMarker = L.marker([task.citizen_id.location.latitude, task.citizen_id.location.longitude], {icon: pendingRequestIcon});
                pendingRequestsGroup.addLayer(taskMarker);
            }
        } else {
            if (task.status === 'in_progress') {
                taskMarker = L.marker([task.citizen_id.location.latitude, task.citizen_id.location.longitude], {icon: assignedOfferIcon});
                assignedOffersGroup.addLayer(taskMarker);
            } else {
                taskMarker = L.marker([task.citizen_id.location.latitude, task.citizen_id.location.longitude], {icon: pendingOfferIcon});
                pendingOffersGroup.addLayer(taskMarker);
            }
        }

        // Format the assignment date
        const assignmentDate = task.assignedAt ? new Date(task.assignedAt).toLocaleString() : '-';

        // Get vehicle name if the task is assigned to it
        const vehicleUsername = task.rescuer_id ? data.vehicle.name : '-';

        // If the task is not assigned yet, include the Claim Task button
        const claimButton = !task.rescuer_id ? `<button class="btn btn-primary mt-3" onclick="claimTask('${task._id}')">Claim Task</button>` : '';

        // Create the popup content for the task marker using the task data
        taskMarker.bindPopup(`
                Name: ${task.citizen_id.name}<br> 
                Surname: ${task.citizen_id.surname}<br>
                Phone: ${task.citizen_id.phone_number}<br>
                Product: ${task.product_id.name}<br>
                Quantity: ${task.quantity}<br>
                Assignment Date: ${assignmentDate}<br>
                Vehicle: ${vehicleUsername}<br>
                ${claimButton}
            `);

        // Add task marker to the cluster group
        taskClusters.addLayer(taskMarker);

        // Add the task cluster group to the map
        map.addLayer(taskClusters);

        // Draw lines from the rescuer's vehicle to assigned tasks
        drawLines(data, linesGroup, originalLatLng, map);
    });

    // Apply the filter handlers for the different task types and statuses
    handleTaskFilterChanges('assigned-requests', assignedRequestsGroup, taskClusters, map);
    handleTaskFilterChanges('pending-requests', pendingRequestsGroup, taskClusters, map);
    handleTaskFilterChanges('assigned-offers', assignedOffersGroup, taskClusters, map);
    handleTaskFilterChanges('pending-offers', pendingOffersGroup, taskClusters, map);

    // Apply the filter handlers for the lines
    handleFilterChanges('straight-lines', linesGroup, map);
});


///////////////////////////////////////////////////////////////////////////////////
// Task Management Section
///////////////////////////////////////////////////////////////////////////////////

// Fetch the data for the tasks assigned to the rescuer
async function fetchRescuerTasks() {
    try {
        const response = await fetch('/view-rescuer-tasks');
        return await response.json();
    } catch (error) {
        console.error('Error fetching rescuer tasks:', error);
    }
}

// Function to load the tasks assigned to the rescuer in HTML
async function loadTasks() {
    const tasks = await fetchRescuerTasks();
    const tasksContainer = document.querySelector('.current-tasks');

    // Clear existing tasks
    tasksContainer.innerHTML = '';

    // Check if there are tasks
    if (tasks.length === 0) {
        tasksContainer.innerHTML = '<p class="text-center">No tasks assigned.</p>';
        return;
    }

    // Populate tasks dynamically
    tasks.forEach((task, index) => {
        const taskHTML = `
            <div class="col-lg-4 col-md-6 col-sm-12 mb-2">
                <div class="task-item p-3 border">
                    <h3 class="mb-3 text-center">Task ${index + 1}:</h3>
                    <p><strong>Citizen Name: </strong>${task.citizen_name}</p>
                    <p><strong>Citizen Surname: </strong>${task.citizen_surname}</p>
                    <p><strong>Phone Number: </strong>${task.citizen_phone}</p>
                    <p><strong>Date Created: </strong>${new Date(task.date_created).toLocaleDateString()}</p>
                    <p><strong>Type: </strong>${task.type === 'request' ? 'Request' : 'Offer'}</p>
                    <p><strong>Product: </strong>${task.product_name}</p>
                    <p><strong>Quantity: </strong>${task.quantity}</p>
                    <div class="text-center">
                        <button class="btn btn-success me-2 complete-task-btn" data-task-id="${task.task_id}" disabled>Complete</button>
                        <button class="btn btn-danger cancel-task-btn" data-task-id="${task.task_id}">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        tasksContainer.innerHTML += taskHTML;
    });
}

// Function to check if the rescuer is within 50 meters of the tasks
async function checkDistanceToTasks() {
    try {
        const response = await fetch('/check-distance-to-task-for-complete-button');
        const data = await response.json();

        if (response.ok) {
            // Check if there are no tasks assigned or in progress
            if (data.message === 'No tasks assigned or in progress') {
                return;
            }

            // Enable the "Complete" button for tasks within range
            data.forEach(task => {
                const completeButton = document.querySelector(`.complete-task-btn[data-task-id="${task.task_id}"]`);
                if (task.withinRange) {
                    completeButton.removeAttribute('disabled');
                } else {
                    completeButton.setAttribute('disabled', 'true');
                }
            });
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error checking distance to tasks:', error);
        alert('Failed to check the distance to tasks. Please try again.');
    }
}

// Function to complete a task
async function completeTask(taskId) {
    try {
        const response = await fetch(`/complete-task/${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            // Remove the completed task from the UI
            const taskElement = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
            if (taskElement) {
                taskElement.remove();
            }
            alert('Task completed successfully!');
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error completing task:', error);
        alert('Failed to complete the task. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Load tasks when the page is loaded
    loadTasks()
        .then(() => {
            // Check the distance to tasks after they have been loaded
            checkDistanceToTasks();

            // Regularly check the distance to tasks every 10 seconds
            setInterval(checkDistanceToTasks, 10000);
        })
        .catch(error => {
            console.error('Error loading tasks:', error);
            alert('Failed to load tasks. Please try again.');
        });
});