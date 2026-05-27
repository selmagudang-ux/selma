const API_URL =
"https://script.google.com/macros/s/AKfycbzyNclpKl_ZdmyQ4mTx8NfmFjtjWBnvYddBxwcAKdrD3b417oUbgVpwnrppZKgBDYgj/exec";



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
// NORMALIZE
// =========================
function normalizeText(text) {

  return text
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]/g, "");
}



// =========================
// LEVENSHTEIN
// =========================
function levenshtein(a, b) {

  const matrix = [];



  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }



  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }



  for (let i = 1; i <= b.length; i++) {

    for (let j = 1; j <= a.length; j++) {

      if (
        b.charAt(i - 1) ==
        a.charAt(j - 1)
      ) {

        matrix[i][j] =
          matrix[i - 1][j - 1];

      } else {

        matrix[i][j] =
          Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
      }
    }
  }



  return matrix[b.length][a.length];
}



// =========================
// FIND BEST SKU
// =========================
function findBestSKU(filename) {

  const cleanFile =
    normalizeText(filename);



  let bestMatch = null;

  let bestScore = 999;



  for (const item of skuData) {

    const cleanSku =
      normalizeText(item.sku);



    // exact
    if (
      cleanFile ==
      cleanSku
    ) {

      return {
        sku: item.sku,
        score: 0
      };
    }



    // includes
    if (
      cleanFile.includes(cleanSku) ||
      cleanSku.includes(cleanFile)
    ) {

      return {
        sku: item.sku,
        score: 1
      };
    }



    // typo
    const distance =
      levenshtein(
        cleanFile,
        cleanSku
      );



    if (
      distance <
      bestScore
    ) {

      bestScore =
        distance;

      bestMatch =
        item.sku;
    }
  }



  if (
    bestScore <= 3
  ) {

    return {
      sku: bestMatch,
      score: bestScore
    };
  }



  return null;
}



// =========================
// CEK FOTO
// =========================
function hasImage(sku) {

  const found =
    skuData.find(
      item =>
        item.sku == sku
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



    suggestions.innerHTML =
      "";



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



// =========================
// SELECT SKU
// =========================
function selectSKU(sku) {

  skuInput.value =
    sku;



  suggestions.innerHTML =
    "";
}



// =========================
// CLOSE SUGGESTION
// =========================
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
// ADD SKU
// =========================
function addSKU() {

  const sku =
    skuInput.value.trim();



  if (!sku) return;



  if (
    selectedSKU.includes(
      sku
    )
  ) {

    alert(
      "SKU sudah ada"
    );

    return;
  }



  selectedSKU.push(
    sku
  );



  renderSKU();



  skuInput.value =
    "";



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



    handleFiles(
      files
    );



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

      const originalName =
        file.name;



      const filename =
        file.name
        .split(".")[0];



      const result =
        findBestSKU(
          filename
        );



      if (result) {

        if (
          !selectedSKU.includes(
            result.sku
          )
        ) {

          selectedSKU.push(
            result.sku
          );
        }



        const scoreText =
          result.score == 0
          ? "Exact Match"
          : result.score == 1
          ? "Similar Match"
          : "Typo Match";



        bulkPreview.innerHTML += `

        <div class="bulk-item success">

          ✅ ${originalName}

          <br>

          → ${result.sku}

          <br>

          <small>
            ${scoreText}
          </small>

        </div>
        `;

      } else {

        bulkPreview.innerHTML += `

        <div class="bulk-item error">

          ❌ ${originalName}

          <br>

          SKU tidak ditemukan

        </div>
        `;
      }
    });



  renderSKU();
}



// =========================
// PREVIEW FOTO
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
// BASE64
// =========================
function toBase64(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();



      reader.readAsDataURL(
        file
      );



      reader.onload =
        () => {

          resolve(
            reader.result
            .split(",")[1]
          );
        };



      reader.onerror =
        error =>
          reject(error);
    }
  );
}



// =========================
// UPLOAD
// =========================
async function uploadImage() {

  const files =
    Array.from(
      fileInput.files
    );



  const status =
    document.getElementById(
      "status"
    );



  const uploadBtn =
    document.querySelector(
      'button[onclick="uploadImage()"]'
    );



  if (
    files.length == 0
  ) {

    alert(
      "Pilih foto dulu"
    );

    return;
  }



  status.innerHTML =
    "Uploading...";



  uploadBtn.disabled =
    true;



  uploadBtn.innerText =
    "Uploading...";



  try {

    // =====================
    // MODE 1
    // 1 FOTO → BANYAK SKU
    // =====================
    if (
      files.length == 1 &&
      selectedSKU.length > 0
    ) {

      const file =
        files[0];



      const base64 =
        await toBase64(
          file
        );



      for (
        const sku of selectedSKU
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
        `✅ 1 foto berhasil upload ke ${selectedSKU.length} SKU`;
    }



    // =====================
    // MODE 2
    // AUTO MULTI FOTO
    // =====================
    else {

      let success =
        0;



      for (
        const file of files
      ) {

        const filename =
          file.name
          .split(".")[0];



        const result =
          findBestSKU(
            filename
          );



        if (!result)
          continue;



        const sku =
          result.sku;



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



        const base64 =
          await toBase64(
            file
          );



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



        success++;
      }



      status.innerHTML =
        `✅ ${success} foto berhasil upload otomatis`;
    }



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
// RESET
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
// FILTER SKU
// =========================
function filterSKU(type) {

  const result =
    document.getElementById(
      "filter-result"
    );



  result.innerHTML =
    "";



  let filtered =
    [];



  if (
    type == "all"
  ) {

    filtered =
      skuData;

  } else if (
    type == "with-image"
  ) {

    filtered =
      skuData.filter(
        item => item.link
      );

  } else {

    filtered =
      skuData.filter(
        item => !item.link
      );
  }



  filtered.forEach(item => {

    result.innerHTML += `

    <div class="filter-item">

      <div>

        <b>${item.sku}</b>

        <br>

        ${item.kategori || ""}

      </div>

      ${
        item.link
        ?

        `<img src="${item.link}">`

        :

        `❌`
      }

    </div>
    `;
  });
}



// =========================
// START
// =========================
loadSKU();
