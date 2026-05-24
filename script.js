const API_URL =
"https://script.google.com/macros/s/AKfycby3o6bUEgkmLVtfXgYcMZtf5OYQWkPUinOpJq88QjwsKqfIaa9HAbHMV0QZdSchoBCr/exec";



let skuData = [];



async function loadSKU() {

  const response = await fetch(
    API_URL + "?action=getSKU"
  );

  skuData =
    await response.json();

  console.log(skuData);
}

loadSKU();





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

    previewImage(
      files[0]
    );
  }
);



// pilih file
fileInput.addEventListener(
  "change",
  () => {

    previewImage(
      fileInput.files[0]
    );
  }
);



// preview
function previewImage(file) {

  if (!file) return;

  const reader =
    new FileReader();

  reader.onload = function(e) {

    const preview =
      document.getElementById(
        "preview"
      );

    preview.src =
      e.target.result;

    preview.style.display =
      "block";
  }

  reader.readAsDataURL(file);
}





// upload
async function uploadImage() {

  const skuText =
    document.getElementById(
      "sku"
    ).value;

  const file =
    fileInput.files[0];

  const status =
    document.getElementById(
      "status"
    );



  if (!skuText || !file) {

    alert(
      "SKU dan foto wajib"
    );

    return;
  }



  const skuList =
    skuText
    .split("\n")
    .map(s => s.trim())
    .filter(s => s);



  status.innerHTML =
    "Uploading...";



  const reader =
    new FileReader();

  reader.readAsDataURL(file);



  reader.onload = async () => {

    try {

      const base64 =
        reader.result
        .split(",")[1];



      for (const sku of skuList) {

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



    } catch(err) {

      console.log(err);

      status.innerHTML =
        "❌ Upload gagal";
    }
  }
}





// delete
async function deleteImage() {

  const skuText =
    document.getElementById(
      "sku"
    ).value;

  const skuList =
    skuText
    .split("\n")
    .map(s => s.trim())
    .filter(s => s);



  if (skuList.length == 0) {

    alert(
      "Masukkan SKU"
    );

    return;
  }



  for (const sku of skuList) {

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



  document.getElementById(
    "status"
  ).innerHTML =
    "Foto berhasil dihapus";
}





// preview foto lama
document
  .getElementById("sku")
  .addEventListener(
    "input",
    function() {

      const sku =
        this.value
        .split("\n")[0]
        .trim();

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
});
