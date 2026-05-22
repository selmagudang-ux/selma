
const API_URL =
"https://script.google.com/macros/s/AKfycbx7gtYQ4TNB-6nyxaZCOZNclOy-Hpir4SgY5-8DObxM7aqO_lkz98Lxtzns8STunIpE/exec";


async function loadSKU() {

  const response = await fetch(
  API_URL + "?action=getSKU"
);

  const data = await response.json();

  const datalist =
    document.getElementById("sku-list");

  datalist.innerHTML = "";

  data.forEach(item => {

    const option =
      document.createElement("option");

    option.value = item.sku;

    datalist.appendChild(option);
  });
}

loadSKU();

async function uploadImage() {

  const sku =
    document.getElementById("sku").value;

  const file =
    document.getElementById("image").files[0];

  const status =
    document.getElementById("status");

  if (!sku || !file) {

    alert("SKU dan foto wajib diisi");
    return;
  }

  status.innerHTML = "Uploading...";

  const reader = new FileReader();

  reader.readAsDataURL(file);

  reader.onload = async () => {

    try {

      const base64 =
        reader.result.split(",")[1];

      const response = await fetch(
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

      const result =
        await response.json();

      console.log(result);

      if (result.status == "success") {

        status.innerHTML =
          "✅ Upload berhasil";

      } else {

        status.innerHTML =
          "❌ " + result.message;
      }

    } catch(err) {

      console.log(err);

      status.innerHTML =
        "❌ Upload gagal";
    }
  }
}

async function deleteImage() {

  const sku =
    document.getElementById("sku").value;

  if (!sku) {

    alert("Pilih SKU");
    return;
  }

  const response = await fetch(
    API_URL,
    {

      method: "POST",

      body: JSON.stringify({

        action: "delete",
        sku: sku
      })
    }
  );

  const result =
    await response.json();

  if (result.status == "success") {

    document.getElementById("status")
      .innerHTML =
      "Foto berhasil dihapus";

  } else {

    document.getElementById("status")
      .innerHTML =
      result.message;
  }
}
document
  .getElementById("image")
  .addEventListener("change", function(e) {

    const file =
      e.target.files[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = function(event) {

      const preview =
        document.getElementById("preview");

      preview.src =
        event.target.result;

      preview.style.display =
        "block";
    }

    reader.readAsDataURL(file);
});

document
  .getElementById("sku")
  .addEventListener("change", async function() {

    const sku = this.value;

    const response =
    await fetch(
	API_URL +
	"?action=getImage&sku=" +
	sku
	);

    const result =
      await response.json();

    const oldPreview =
      document.getElementById(
        "old-preview"
      );

    if (result.link) {

      oldPreview.src =
        result.link;

      oldPreview.style.display =
        "block";

    } else {

      oldPreview.style.display =
        "none";
    }
});