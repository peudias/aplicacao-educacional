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
    selectedImages.forEach((image, index) => {
        console.log(`Adicionando imagem ${index + 1}: ${image.name}`);
        formData.append(`images`, image);
    });

    try {
        document.getElementById("simulateButton").disabled = true;
        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            alert("Imagens carregadas com sucesso!");
            const result = await response.json();
            displayResult(result);
            resetUpload();
        } else {
            alert("Erro ao carregar imagens!");
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao carregar imagens?");
    } finally {
        document.getElementById("simulateButton").disabled = false;
    }
}

function resetUpload() {
    selectedImages = [];
    currentImageCount = 0;
    document.getElementById("uploadedImageContainer").innerHTML = "";
    document.getElementById("fileInput2").value = "";
    document.getElementById("fileInput2").disabled = false;
}

function displayResult(result) {
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
            imgElement.src = `/src/api/img/${item.name}`;
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
