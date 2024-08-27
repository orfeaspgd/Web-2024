//login page create account
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
            let messageElement = document.getElementById('create_message');
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