// Check if the logout button exists before adding the event listener
const logoutButton = document.getElementById('logoutButton');

if (logoutButton) {
    logoutButton.addEventListener('click', function() {
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
}