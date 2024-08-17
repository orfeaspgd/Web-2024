//login
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let formData = new URLSearchParams(new FormData(this)).toString();
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            let messageElement = document.getElementById('message');
            if (data.status === 'success') {
                window.location.href = data.redirectUrl;
            } else {
                messageElement.style.color = 'red';
            }
            messageElement.textContent = data.message;
        })
        .catch(error => console.error('Error:', error));
});
