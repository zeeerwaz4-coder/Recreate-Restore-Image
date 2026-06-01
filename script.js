window.onload = () => {

  const speech = new SpeechSynthesisUtterance(
    "Welcome to Recreate and Restore"
  );
  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);

  const input = document.getElementById("imageUpload");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  let img = new Image();

  let currentBrightness = 1;
  let currentColor = false;

  function drawImage(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.filter = `
      brightness(${currentBrightness})
      saturate(${currentColor ? 2 : 1})
    `;

    ctx.drawImage(img,0,0,canvas.width,canvas.height);
  }

  function loadImage(file){
    const reader = new FileReader();

    reader.onload = function(e){
      img = new Image();

      img.onload = function(){
        canvas.width = 500;
        canvas.height = 300;
        currentBrightness = 1;
        currentColor = false;
        drawImage();
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  input.addEventListener("change", function(){
    if(this.files[0]){
      loadImage(this.files[0]);
    }
  });

  // 🔥 TOOLS
  window.instaColor = function(){
    currentColor = true;
    drawImage();
  };

  window.brightness = function(){
    currentBrightness += 0.2;
    drawImage();
  };

  window.resetImage = function(){
    currentBrightness = 1;
    currentColor = false;
    drawImage();
  };

};
