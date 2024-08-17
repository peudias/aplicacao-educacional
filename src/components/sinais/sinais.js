let maxImages = 3;
let currentImageCount = 0;
let selectedImages = [];

function triggerFileInput(id) {
    document.getElementById(id).click();
}

function handleFileInput(event) {
    const files = event.target.files;

    if (currentImageCount + files.length > maxImages) {
        alert(`Você só pode carregar até ${maxImages} imagens.`);
        event.target.value = "";
        return;
    }

    Array.from(files).forEach(file => {
        if (currentImageCount >= maxImages) {
            return;
        }

        // const file = event.target.files[0];
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

                if (currentImageCount >= maxImages) {
                    //document.getElementById("fileInput2").disabled = true;
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

function removeImage(imageWrapper, file) {
    imageWrapper.remove();
    currentImageCount--;
    // document.getElementById("fileInput2").value = "";

    if (currentImageCount < maxImages) {
        document.getElementById("fileInput2").disabled = false;
    }

    const index = selectedImages.indexOf(file);
    if (index > -1) {
        selectedImages.splice(index, 1);
    }
}

function goBack() {
    window.history.back();
}

async function simulate() {
    if (selectedImages.length < 1) {
        alert("Selecione pelo menos 1 imagem para classificar.");
        return;
    }

    const formData = new FormData();
    selectedImages.forEach(image => {
        formData.append("images", image);
    });

    try {
        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            alert("Imagens carregadas com sucesso!");
        } else {
            alert("Erro ao carregar imagens.");
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao carregar imagens.");
    }

    // selectedImages.forEach((image, index) => {
    //     console.log(`Imagem ${index + 1}: `, image);
    //});

    alert("Classificação realizada com sucesso!");
}
