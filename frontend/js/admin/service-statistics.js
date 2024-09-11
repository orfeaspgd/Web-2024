// Get date range form and chart context elements
const dateRangeForm = document.getElementById('dateRangeForm');
const ctx = document.getElementById('tasksChart').getContext('2d');

// Variable to hold the current chart instance
let currentChart = null;

// Function that fetches task statistics from the server
async function fetchTaskStatistics(startDate, endDate) {
    try {
        // Construct the URL for the task statistics endpoint
        let url = '/task-statistics';
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        } else if (startDate) {
            url += `?startDate=${startDate}`;
        } else if (endDate) {
            url += `?endDate=${endDate}`;
        }

        // Fetch task statistics from the server
        const response = await fetch(url);

        // Parse and return the response as JSON
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function that displays task statistics on the page
async function displayTaskStatistics(startDate, endDate) {
    // Fetch the statistics data
    const data = await fetchTaskStatistics(startDate, endDate);

    // Destroy the existing chart if it exists
    if (currentChart) {
        currentChart.destroy();
    }

    // Create or update the chart with the fetched data
    currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['New Requests', 'New Offers', 'Completed Requests', 'Completed Offers'],
            datasets: [{
                label: 'Task Statistics',
                data: [
                    data.newRequestsCount,
                    data.newOffersCount,
                    data.completedRequestsCount,
                    data.completedOffersCount
                ],
                backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(153, 102, 255, 0.2)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 159, 64, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Add an event listener to the date range form to fetch statistics
dateRangeForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    displayTaskStatistics(startDate, endDate);
});

// Fetch task statistics when the page is loaded
document.addEventListener('DOMContentLoaded', function () {
    displayTaskStatistics();
});