const API_URL =
"https://script.google.com/macros/s/AKfycbx55KOGJKRi-jSVq7HaTS8nyImbvx9pDAFISBX-BxJ2HUz7sUla6GsBIFlV5TtmWJHD/exec";



let selectedSKU = [];
let skuData = [];



// =========================
// ELEMENT
// =========================
const dropArea =
  document.getElementById(
    "drop-area"
  );

const fileInput =
  document.getElementById(
    "image"
  );

const skuInput =
  document.getElementById(
    "sku"
  );

const suggestions =
  document.getElementById(
    "suggestions"
  );



// =========================
// LOAD SKU
// =========================
async function loadSKU() {

  try {

    const response =
      await fetch(
        API_URL +
        "?action=getSKU"
      );



    skuData =
      await response.json();



    console.log(skuData);



    updateDashboard();



  } catch(err) {

    console.log(err);
  }
}



// =========================
// DASHBOARD
// =========================
function updateDashboard() {

  const total =
    skuData.length;



  const withImage =
    skuData.filter(
      item => item.link
    ).length;



  const withoutImage =
    total - withImage;



  document.getElementById(
    "total-sku"
  ).innerText =
    total;



  document.getElementById(
    "with-image"
  ).innerText =
    withImage;



  document.getElementById(
    "without-image"
  ).innerText =
    withoutImage;
}



// =========================
// CEK ADA FOTO
// =========================
function hasImage(sku) {

  const found =
    skuData.find(
      item => item.sku == sku
    );



  return (
    found &&
    found.link
  );
}



// =========================
// SEARCH SKU
// =========================
skuInput.addEventListener(
  "input",
  function() {

    const keyword =
      this.value
      .toLowerCase();



    suggestions.innerHTML = "";



    if (!keyword) return;



    const filtered =
      skuData
      .filter(item =>

        item.sku
        .toLowerCase()
        .includes(keyword)
      )
      .slice(0, 10);



    filtered.forEach(item => {

      suggestions.innerHTML += `

      <div
        class="suggestion-item"
        onclick="selectSKU('${item.sku}')">

        ${item.sku}

      </div>
      `;
    });
  }
);



// pilih suggestion
function selectSKU(sku) {

  skuInput.value =
    sku;



  suggestions.innerHTML =
    "";
}



// close suggestion
document.addEventListener(
  "click",
  function(e) {

    if (
      !e.target.closest(
        ".search-box"
      )
    ) {

      suggestions.innerHTML =
        "";
    }
  }
);



// =========================
// TAMBAH SKU
// =========================
function addSKU() {

  const sku =
    skuInput.value.trim();



  if (!sku) return;



  if (
    selectedSKU.includes(sku)
  ) {

    alert(
      "SKU sudah ada"
    );

    return;
  }



  selectedSKU.push(sku);



  renderSKU();



  skuInput.value = "";



  // preview lama
  const oldPreview =
    document.getElementById(
      "old-preview"
    );



  const found =
    skuData.find(
      item =>
        item.sku == sku
    );



  if (
    found &&
    found.link
  ) {

    oldPreview.src =
      found.link +
      "&t=" +
      new Date().getTime();



    oldPreview.style.display =
      "block";

  } else {

    oldPreview.style.display =
      "none";
  }
}



// =========================
// RENDER SKU
// =========================
function renderSKU() {

  const container =
    document.getElementById(
      "sku-container"
    );



  container.innerHTML =
    "";



  selectedSKU.forEach(
    (sku, index) => {

      container.innerHTML += `

      <div class="sku-item">

        <span>${sku}</span>

        <button
          class="remove-btn"
          onclick="removeSKU(${index})">

          X

        </button>

      </div>
      `;
    }
  );
}



// =========================
// REMOVE SKU
// =========================
function removeSKU(index) {

  selectedSKU.splice(
    index,
    1
  );



  renderSKU();
}



// =========================
// DRAG DROP
// =========================

// klik
dropArea.addEventListener(
  "click",
  () => {

    fileInput.click();
  }
);



// drag over
dropArea.addEventListener(
  "dragover",
  (e) => {

    e.preventDefault();

    dropArea.classList.add(
      "dragover"
    );
  }
);



// drag leave
dropArea.addEventListener(
  "dragleave",
  () => {

    dropArea.classList.remove(
      "dragover"
    );
  }
);



// drop
dropArea.addEventListener(
  "drop",
  (e) => {

    e.preventDefault();

    dropArea.classList.remove(
      "dragover"
    );



    const files =
      e.dataTransfer.files;



    fileInput.files =
      files;



    handleFiles(files);



    previewImage(
      files[0]
    );
  }
);



// pilih file
fileInput.addEventListener(
  "change",
  () => {

    handleFiles(
      fileInput.files
    );



    previewImage(
      fileInput.files[0]
    );
  }
);



// =========================
// HANDLE FILES
// =========================
function handleFiles(files) {

  const bulkPreview =
    document.getElementById(
      "bulk-preview"
    );



  bulkPreview.innerHTML =
    "";



  Array.from(files)
    .forEach(file => {

      const filename =
        file.name
        .split(".")[0]
        .trim();



      const found =
        skuData.find(
          item =>
            item.sku ==
            filename
        );



      if (found) {

        if (
          !selectedSKU.includes(
            filename
          )
        ) {

          selectedSKU.push(
            filename
          );
        }



        bulkPreview.innerHTML += `

        <div class="bulk-item">

          ✅ ${filename}

        </div>
        `;

      } else {

        bulkPreview.innerHTML += `

        <div class="bulk-item">

          ❌ ${filename}
          (SKU tidak ada)

        </div>
        `;
      }
    });



  renderSKU();
}



// =========================
// PREVIEW FOTO BARU
// =========================
function previewImage(file) {

  if (!file) return;



  const reader =
    new FileReader();



  reader.onload =
    function(e) {

      const preview =
        document.getElementById(
          "preview"
        );



      preview.src =
        e.target.result;



      preview.style.display =
        "block";
    }



  reader.readAsDataURL(
    file
  );
}



// =========================
// UPLOAD
// =========================
async function uploadImage() {

  const skuList =
    selectedSKU;



  const file =
    fileInput.files[0];



  const status =
    document.getElementById(
      "status"
    );



  const uploadBtn =
    document.querySelector(
      'button[onclick="uploadImage()"]'
    );



  if (
    skuList.length == 0 ||
    !file
  ) {

    alert(
      "SKU dan foto wajib"
    );

    return;
  }



  status.innerHTML =
    "Uploading...";



  uploadBtn.disabled =
    true;



  uploadBtn.innerText =
    "Uploading...";



  const reader =
    new FileReader();



  reader.readAsDataURL(
    file
  );



  reader.onload =
    async () => {

      try {

        const base64 =
          reader.result
          .split(",")[1];



        for (
          const sku of skuList
        ) {

          if (
            hasImage(sku)
          ) {

            const confirmReplace =
              confirm(
                sku +
                " sudah punya foto.\nReplace?"
              );



            if (
              !confirmReplace
            ) {

              continue;
            }
          }



          await fetch(
            API_URL,
            {

              method: "POST",

              body: JSON.stringify({

                sku: sku,

                image: base64,

                mime: file.type
              })
            }
          );
        }



        status.innerHTML =
          "✅ Upload berhasil ke "
          +
          skuList.length +
          " SKU";



        uploadBtn.disabled =
          false;



        uploadBtn.innerText =
          "Upload";



        resetForm();



        await loadSKU();



      } catch(err) {

        console.log(err);



        status.innerHTML =
          "❌ Upload gagal";



        uploadBtn.disabled =
          false;



        uploadBtn.innerText =
          "Upload";
      }
    }
}



// =========================
// DELETE
// =========================
async function deleteImage() {

  const skuList =
    selectedSKU;



  const status =
    document.getElementById(
      "status"
    );



  const deleteBtn =
    document.querySelector(
      'button[onclick="deleteImage()"]'
    );



  if (
    skuList.length == 0
  ) {

    alert(
      "Masukkan SKU"
    );

    return;
  }



  status.innerHTML =
    "Deleting...";



  deleteBtn.disabled =
    true;



  deleteBtn.innerText =
    "Deleting...";



  try {

    for (
      const sku of skuList
    ) {

      await fetch(
        API_URL,
        {

          method: "POST",

          body: JSON.stringify({

            action: "delete",

            sku: sku
          })
        }
      );
    }



    status.innerHTML =
      "✅ Foto berhasil dihapus";



    deleteBtn.disabled =
      false;



    deleteBtn.innerText =
      "Hapus Foto";



    resetForm();



    await loadSKU();



  } catch(err) {

    console.log(err);



    status.innerHTML =
      "❌ Gagal menghapus foto";



    deleteBtn.disabled =
      false;



    deleteBtn.innerText =
      "Hapus Foto";
  }
}



// =========================
// RESET FORM
// =========================
function resetForm() {

  skuInput.value =
    "";



  selectedSKU =
    [];



  renderSKU();



  fileInput.value =
    "";



  document.getElementById(
    "preview"
  ).style.display =
    "none";



  document.getElementById(
    "old-preview"
  ).style.display =
    "none";



  document.getElementById(
    "bulk-preview"
  ).innerHTML =
    "";
}



// =========================
// START
// =========================
loadSKU();
