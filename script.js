// script.js

window.onload = () => {

  // Greeting
  const speech = new SpeechSynthesisUtterance(
    "Welcome to Recreate and Restore"
  );
  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);

  const uploadBox = document.querySelector(".upload-box");
  const input = document.getElementById("imageUpload");

  // show image function
  function showImage(file) {
    const reader = new FileReader();

    reader.onload = function (e) {

      let oldImg = uploadBox.querySelector("img");
      if (oldImg) oldImg.remove();

      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.maxWidth = "100%";
      img.style.maxHeight = "100%";
      img.style.borderRadius = "15px";

      uploadBox.appendChild(img);
    };

    reader.readAsDataURL(file);
  }

  // click upload
  input.addEventListener("change", function () {
    if (this.files[0]) {
      showImage(this.files[0]);
    }
  });

  // drag over
  uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.style.border = "3px solid #00ffd5";
  });

  // drag leave
  uploadBox.addEventListener("dragleave", () => {
    uploadBox.style.border = "3px dashed #00ffd5";
  });

  // drop
  uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadBox.style.border = "3px dashed #00ffd5";

    const file = e.dataTransfer.files[0];
    if (file) {
      showImage(file);
    }
  });

};
