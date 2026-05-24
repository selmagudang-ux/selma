const API_URL =
"https://script.google.com/macros/s/AKfycbx55KOGJKRi-jSVq7HaTS8nyImbvx9pDAFISBX-BxJ2HUz7sUla6GsBIFlV5TtmWJHD/exec";



let selectedSKU = [];
let skuData = [];



// load sku
async function loadSKU() {

  const response = await fetch(
    API_URL + "?action=getSKU"
  );

  skuData =
    await response.json();

  console.log(skuData);



  const datalist =
    document.getElementById(
      "sku-list"
    );



  datalist.innerHTML = "";



  skuData.forEach(item => {

    const option =
      document.createElement(
        "option"
      );

    option.value =
      item.sku;

    datalist.appendChild(
      option
    );
  });
}

loadSKU();
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




// tambah sku
function addSKU() {

  const input =
    document.getElementById(
      "sku"
    );

  const sku =
    input.value.trim();



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



  input.value = "";



  // preview foto lama
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
      found.link;

    oldPreview.style.display =
      "block";

  } else {

    oldPreview.style.display =
      "none";
  }
}





// render sku
function renderSKU() {

  const container =
    document.getElementById(
      "sku-container"
    );



  container.innerHTML = "";



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





// remove sku
function removeSKU(index) {

  selectedSKU.splice(
    index,
    1
  );

  renderSKU();
}





// drag drop
const dropArea =
  document.getElementById(
    "drop-area"
  );

const fileInput =
  document.getElementById(
    "image"
  );



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

    handleFiles(
  fileInput.files
    );
  }
);

function handleFiles(files) {

  const bulkPreview =
    document.getElementById(
      "bulk-preview"
    );



  bulkPreview.innerHTML = "";



  selectedSKU = [];



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

        selectedSKU.push(
          filename
        );



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

// pilih file
fileInput.addEventListener(
  "change",
  () => {

    previewImage(
      fileInput.files[0]
    );
  }
);





// preview foto baru
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





// upload
async function uploadImage() {

  const skuList =
    selectedSKU;

  const file =
    fileInput.files[0];

  const status =
    document.getElementById(
      "status"
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

  if (hasImage(sku)) {

    const confirmReplace =
      confirm(
        sku +
        " sudah punya foto.\nReplace?"
      );



    if (!confirmReplace) {

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
          + skuList.length +
          " SKU";
        
        resetForm();


      } catch(err) {

        console.log(err);

        status.innerHTML =
          "❌ Upload gagal";
      }
    }
}





// delete
async function deleteImage() {

  const skuList =
    selectedSKU;

  const status =
    document.getElementById(
      "status"
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



    resetForm();



  } catch(err) {

    console.log(err);

    status.innerHTML =
      "❌ Gagal menghapus foto";
  }
}
function resetForm() {

  // kosongkan input sku
  document
    .getElementById("sku")
    .value = "";



  // kosongkan array sku
  selectedSKU = [];



  // render ulang
  renderSKU();



  // reset file input
  fileInput.value = "";



  // sembunyikan preview baru
  document
    .getElementById("preview")
    .style.display = "none";



  // sembunyikan preview lama
  document
    .getElementById("old-preview")
    .style.display = "none";
}
console.log(skuData);
updateDashboard();

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

