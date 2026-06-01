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

  let brightnessValue = 1;
  let colorOn = false;
  let frameOn = false;

  // image position (for drag)
  let imgX = 0;
  let imgY = 0;
  let dragging = false;
  let startX, startY;

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.filter = `
      brightness(${brightnessValue})
      saturate(${colorOn ? 2 : 1})
    `;

    ctx.drawImage(img, imgX, imgY, canvas.width, canvas.height);

    if(frameOn){
      ctx.strokeStyle = "#00ffd5";
      ctx.lineWidth = 10;
      ctx.strokeRect(0,0,canvas.width,canvas.height);
    }
  }

  function load(file){
    const reader = new FileReader();

    reader.onload = function(e){
      img = new Image();

      img.onload = function(){
        canvas.width = 500;
        canvas.height = 300;

        brightnessValue = 1;
        colorOn = false;
        frameOn = false;

        imgX = 0;
        imgY = 0;

        draw();
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  input.addEventListener("change", function(){
    if(this.files[0]) load(this.files[0]);
  });

  // 🔥 DRAG IMAGE (TRIM/MOVE)
  canvas.addEventListener("mousedown", (e) => {
    dragging = true;
    startX = e.offsetX - imgX;
    startY = e.offsetY - imgY;
  });

  canvas.addEventListener("mousemove", (e) => {
    if(dragging){
      imgX = e.offsetX - startX;
      imgY = e.offsetY - startY;
      draw();
    }
  });

  canvas.addEventListener("mouseup", () => dragging = false);
  canvas.addEventListener("mouseleave", () => dragging = false);

  // TOOLS
  window.instaColor = function(){
    colorOn = true;
    draw();
  };

  window.setBrightness = function(value){
    brightnessValue = value;
    draw();
  };

  window.addFrame = function(){
    frameOn = true;
    draw();
  };

  window.resetImage = function(){
    brightnessValue = 1;
    colorOn = false;
    frameOn = false;
    imgX = 0;
    imgY = 0;
    draw();
  };

};
