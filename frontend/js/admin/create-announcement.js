//add product to announcement
document.getElementById('addProductButton').addEventListener('click', function() {
    const productsContainer = document.getElementById('productsContainer');
    if (productsContainer.children.length >= 10) {
        alert('You can only add up to 10 products.');
        return;
    }

    const newProductEntry = document.createElement('div');
    newProductEntry.classList.add('productEntry');
    const index = productsContainer.children.length;
    newProductEntry.innerHTML = `
        <label for="selectProduct${index}">Product:</label>
        <select class="selectProduct" id="selectProduct${index}" name="selectProduct[]" required></select>
        <button type="button" class="removeProductButton">Remove</button>
    `;
    productsContainer.appendChild(newProductEntry);

    fetch('/products')
        .then(response => response.json())
        .then(data => {
            const selectProduct = newProductEntry.querySelector('.selectProduct');
            data.forEach(product => {
                const option = document.createElement('option');
                option.value = product._id;
                option.textContent = product.name;
                selectProduct.appendChild(option);
            });
        })
        .catch(error => console.error('Error:', error));
});


//remove products from announcement
document.getElementById('productsContainer').addEventListener('click', function(event) {
    if (event.target.classList.contains('removeProductButton')) {
        event.target.parentElement.remove();
    }
});

//create announcement
document.getElementById('createAnnouncement').addEventListener('submit', function(event) {
    event.preventDefault();
    let formData = new URLSearchParams(new FormData(this)).toString();
    fetch('/admin_create_announcement', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            let messageElement = document.getElementById('createAnnouncementMessage');
            if (data.status === 'success') {
                messageElement.style.color = 'green';
            } else {
                messageElement.style.color = 'red';
            }
            messageElement.textContent = data.message;
        })
        .catch(error => console.error('Error:', error));
});