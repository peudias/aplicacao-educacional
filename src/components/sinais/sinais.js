let maxImages = 3;
let currentImageCount = 0;
let selectedImages = [];

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
                removeImage(imgWrapper, file);
            };

            imgWrapper.appendChild(imgElement);
            imgWrapper.appendChild(removeButton);
            imgContainer.appendChild(imgWrapper);

            selectedImages.push(file);
            currentImageCount++;
        };
        reader.readAsDataURL(file);
    }
}

function removeImage(imageWrapper, file) {
    imageWrapper.remove();
    currentImageCount--;
    document.getElementById("fileInput2").value = "";

    const index = selectedImages.indexOf(file);
    if (index > -1) {
        selectedImages.splice(index, 1);
    }
}

function goBack() {
    window.history.back();
}

function simulate() {
    if (selectedImages.length < 1) {
        alert("Selecione pelo menos 1 imagem para classificar.");
        return;
    }

    selectedImages.forEach((image, index) => {
        console.log(`Imagem ${index + 1}: `, image);
    });

    alert("Classificação realizada com sucesso!");
}
