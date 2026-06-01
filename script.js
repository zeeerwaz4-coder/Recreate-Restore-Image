// script.js

window.onload = () => {

  console.log("Recreate and Restore Loaded");

  // Optional AI greeting voice
  const speech = new SpeechSynthesisUtterance(
    "Welcome to Recreate and Restore"
  );

  speech.lang = "en-US";

  window.speechSynthesis.speak(speech);

};
// script.js

window.onload = () => {

  // AI greeting
  const speech = new SpeechSynthesisUtterance(
    "Welcome to Recreate and Restore"
  );
  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);

  const input = document.getElementById("imageUpload");
  const uploadBox = document.querySelector(".upload-box");

  input.addEventListener("change", function () {
    const file = this.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {

        // remove old image if exists
        const oldImg = uploadBox.querySelector("img");
        if (oldImg) oldImg.remove();

        // create image preview
        const img = document.createElement("img");
        img.src = e.target.result;
        img.style.maxWidth = "100%";
        img.style.maxHeight = "100%";
        img.style.borderRadius = "15px";

        uploadBox.appendChild(img);
      };

      reader.readAsDataURL(file);
    }
  });

};
