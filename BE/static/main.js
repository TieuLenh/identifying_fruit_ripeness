const dropZone = document.getElementById("dropZone");
const preview = document.getElementById("preview");
const placeholder = document.getElementById("placeholder");

let selectedFile = null;

dropZone.addEventListener("dragover", (e) => {

    e.preventDefault();

    dropZone.classList.add("dragover");

});

dropZone.addEventListener("dragleave", () => {

    dropZone.classList.remove("dragover");

});

dropZone.addEventListener("drop", (e) => {

    e.preventDefault();

    dropZone.classList.remove("dragover");

    const file = e.dataTransfer.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Chỉ được kéo file ảnh");
        return;
    }

    selectedFile = file;

    showPreview(file);

});

function showPreview(file){

    const reader = new FileReader();

    reader.onload = function(event){

        preview.src = event.target.result;

        preview.style.display = "block";

        placeholder.style.display = "none";
    };

    reader.readAsDataURL(file);
}

async function predict(){

    if(!selectedFile){
        alert("Hãy kéo ảnh vào trước");
        return;
    }

    const formData = new FormData();

    formData.append(
        "image",
        selectedFile
    );

    const response = await fetch(
        "/predict",
        {
            method:"POST",
            body:formData
        }
    );

    const result = await response.json();
    standardResults(result);
}

const rawClass = {
    Cachua_Chin_Tot: "Cà chua chín",
    Cachua_Xanh_Tot: "Cà chua xanh",
    Chuoi_Chin_Tot: "Chuối chín",
    Chuoi_Xanh_Tot: "Chuối xanh",
    Tao_Chin_Tot: "Táo chín",
    Tao_Xanh_Tot: "Táo xanh",
}

const standardResults = (data, varQuery = '#result') => {
    const query = document.querySelector(varQuery);
    query.innerHTML = `Đây là ${rawClass[data.class] || data.class} với độ tin cậy ${data.confidence}%`;
}
