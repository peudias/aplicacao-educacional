let maxImages = 3;
let currentImageCount = 0;
let selectedImages = [];

function triggerFileInput(id) {
    document.getElementById(id).click();
}

function handleFileInput(event) {
    const files = event.target.files;

    if (currentImageCount + files.length > maxImages) {
        showCustomAlert(`Você só pode carregar até ${maxImages} imagens.`);
        event.target.value = "";
        return;
    }

    Array.from(files).forEach(file => {
        if (currentImageCount >= maxImages) {
            return;
        }

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

                selectedImages.push({ file: file, src: e.target.result });
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

    if (currentImageCount < maxImages) {
        document.getElementById("fileInput2").disabled = false;
    }

    const index = selectedImages.findIndex(image => image.file === file);
    if (index > -1) {
        selectedImages.splice(index, 1);
    }
}

function goBack() {
    window.history.back();
}

async function simulate() {
    if (selectedImages.length < 1) {
        showCustomAlert("Selecione pelo menos 1 imagem para classificar.");
        return;
    }

    const formData = new FormData();
    selectedImages.forEach((image, index) => {
        console.log(`Adicionando imagem ${index + 1}: ${image.file.name}`);
        formData.append(`images`, image.file);
    });

    try {
        document.getElementById("simulateButton").disabled = true;
        showLoading();
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            showCustomAlert("Imagens carregadas com sucesso!", "success");
            const result = await response.json();
            displayResult(result, selectedImages); // Passar selectedImages para displayResult
            resetUpload();
        } else {
            showCustomAlert("Erro ao carregar imagens.");
        }
    } catch (error) {
        console.error("Erro:", error);
        showCustomAlert("Erro ao carregar imagens.");
    } finally {
        document.getElementById("simulateButton").disabled = false;
        hideLoading();
    }
}

function resetUpload() {
    selectedImages = [];
    currentImageCount = 0;
    document.getElementById("uploadedImageContainer").innerHTML = "";
    document.getElementById("fileInput2").value = "";
    document.getElementById("fileInput2").disabled = false;
}

function displayResult(result, images) {
    const displayResult = document.getElementById("displayResult");
    displayResult.innerHTML = "";

    const resultContainer = document.createElement("div");
    resultContainer.classList.add("display-content");

    const title = document.createElement("h3");
    title.textContent = "Resultado da Classificação:";
    resultContainer.appendChild(title);

    const attributes = result.attributes;

    for (const key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            const item = attributes[key];

            const itemContainer = document.createElement("div");
            itemContainer.classList.add("result-item");

            const imgElement = document.createElement("img");
            // Substituir o caminho da imagem processada pelo caminho da imagem original carregada
            const originalImage = images.find(img => img.file.name === item.original_name);
            if (originalImage) {
                imgElement.src = originalImage.src; // Mostrar a imagem original carregada
                console.log(`Exibindo imagem original para ${item.original_name}: ${imgElement.src}`);
            } else {
                console.warn(`Imagem original não encontrada para ${item.name}`);
            }
            imgElement.alt = item.name;
            imgElement.classList.add("result-image");

            const classificationElement = document.createElement("p");
            classificationElement.textContent = `Classificado como: ${item.classified_as}`;

            const scoreElement = document.createElement("p");
            scoreElement.textContent = `Pontuação: ${item.score}`;

            itemContainer.appendChild(imgElement);
            itemContainer.appendChild(classificationElement);
            itemContainer.appendChild(scoreElement);

            resultContainer.appendChild(itemContainer);
        }
    }

    displayResult.appendChild(resultContainer);
}

function showLoading() {
    document.getElementById("loading").style.display = "flex";
    document.body.style.pointerEvents = "none";
}

function hideLoading() {
    document.getElementById("loading").style.display = "none";
    document.body.style.pointerEvents = "auto";
}

function openPopup() {
    document.getElementById("infoPopup").style.display = "flex";
}

function closePopup() {
    document.getElementById("infoPopup").style.display = "none";
}

function showCustomAlert(message, type = "error") {
    const alertBox = document.getElementById("customAlert");
    const alertMessage = document.getElementById("customAlertMessage");

    alertMessage.textContent = message;

    alertBox.className = "custom-alert";

    if (type === "success") {
        alertBox.classList.add("success");
    }

    alertBox.style.display = "block";
    alertBox.style.opacity = "1";

    setTimeout(function () {
        alertBox.style.opacity = "0";
    }, 2000);

    setTimeout(function () {
        alertBox.style.display = "none";
    }, 3000);
}

function closeCustomAlert() {
    const alertBox = document.getElementById("customAlert");
    alertBox.style.display = "none";
}
