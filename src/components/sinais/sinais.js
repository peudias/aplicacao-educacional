function triggerFileInput(id) {
    document.getElementById(id).click();
}

function handleFileInput(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imgContainer = document.getElementById('uploadedImageContainer');
            imgContainer.innerHTML = `
                <img src="${e.target.result}" alt="Uploaded Image" class="uploaded-image" />
                <button class="remove-image" onclick="removeImage()">x</button>
            `;
        };
        reader.readAsDataURL(file);
    }
}

function removeImage() {
    const imgContainer = document.getElementById('uploadedImageContainer');
    imgContainer.innerHTML = '';
    document.getElementById('fileInput2').value = ''; // Reset the file input
}
