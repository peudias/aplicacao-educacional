let maxImages = 3;
let currentImageCount = 0;

function triggerFileInput(id) {
    document.getElementById(id).click();
}

function handleFileInput(event) {
    if (currentImageCount >= maxImages) {
        alert("Você só pode carregar até 3 imagens.");
        event.target.value = "";
        return;
    }

    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imgContainer = document.getElementById("uploadedImageContainer");

            const imgWrapper = document.createElement("div");
            imgWrapper.classList.add("uploaded-image-container");

            const imgElement = document.createElement("img");
            imgElement.src = e.target.result;
            imgElement.alt = "Uploaded Image";
            imgElement.classList.add("uploaded-image");

            const removeButton = document.createElement("button");
            removeButton.classList.add("remove-image");
            removeButton.textContent = "x";
            removeButton.onclick = function () {
                removeImage(imgWrapper);
            };

            imgWrapper.appendChild(imgElement);
            imgWrapper.appendChild(removeButton);
            imgContainer.appendChild(imgWrapper);

            currentImageCount++;
        };
        reader.readAsDataURL(file);
    }
}

function removeImage(imageWrapper) {
    imageWrapper.remove();
    currentImageCount--;
    document.getElementById("fileInput2").value = "";
}

function goBack() {
    window.history.back();
}
