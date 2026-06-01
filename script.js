window.onload = () => {

  const speech = new SpeechSynthesisUtterance(
    "Welcome to Recreate and Restore"
  );

  speech.lang = "en-US";

  window.speechSynthesis.speak(speech);

  const input = document.getElementById("imageUpload");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const loading = document.getElementById("loading");
  const aiAssistant = document.getElementById("aiAssistant");

  const textInput = document.getElementById("textInput");
  const stickerSelect = document.getElementById("stickerSelect");

  let img = new Image();

  let brightnessValue = 1;
  let colorOn = false;
  let frameOn = false;

  let texts = [];
  let stickers = [];

  let selectedItem = null;
  let dragging = false;

  function showLoading(){

    loading.style.display = "block";

    setTimeout(() => {
      loading.style.display = "none";
    },1500);
  }

  function draw(customFilter = ""){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.filter = `
      brightness(${brightnessValue})
      saturate(${colorOn ? 2 : 1})
      ${customFilter}
    `;

    ctx.drawImage(img,0,0,canvas.width,canvas.height);

    // frame
    if(frameOn){
      ctx.strokeStyle = "#00ffd5";
      ctx.lineWidth = 10;
      ctx.strokeRect(0,0,canvas.width,canvas.height);
    }

    // text
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";

    texts.forEach(text => {
      ctx.fillText(text.value,text.x,text.y);
    });

    // stickers
    ctx.font = "40px Arial";

    stickers.forEach(sticker => {
      ctx.fillText(sticker.value, sticker.x, sticker.y);
    });
  }

  function load(file){

    const reader = new FileReader();

    reader.onload = function(e){

      img = new Image();

      img.onload = function(){

        canvas.width = 500;
        canvas.height = 300;

        draw();
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }

  input.addEventListener("change", function(){

    if(this.files[0]){

      showLoading();

      load(this.files[0]);
    }
  });

  // TEXT

  window.addText = function(){

    const value = textInput.value;

    if(value.trim() !== ""){

      texts.push({
        value:value,
        x:50,
        y:50
      });

      draw();

      textInput.value = "";
    }
  };

  // 🔥 STICKERS

  window.addSticker = function(){

    stickers.push({
      value:stickerSelect.value,
      x:100,
      y:100
    });

    draw();
  };

  // DRAG SYSTEM

  canvas.addEventListener("mousedown", (e) => {

    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    selectedItem = null;

    // texts
    ctx.font = "30px Arial";

    texts.forEach(text => {

      const width = ctx.measureText(text.value).width;

      if(
        mouseX >= text.x &&
        mouseX <= text.x + width &&
        mouseY <= text.y &&
        mouseY >= text.y - 30
      ){
        selectedItem = text;
        dragging = true;
      }
    });

    // stickers
    ctx.font = "40px Arial";

    stickers.forEach(sticker => {

      const width = 40;

      if(
        mouseX >= sticker.x &&
        mouseX <= sticker.x + width &&
        mouseY <= sticker.y &&
        mouseY >= sticker.y - 40
      ){
        selectedItem = sticker;
        dragging = true;
      }
    });
  });

  canvas.addEventListener("mousemove", (e) => {

    if(dragging && selectedItem){

      selectedItem.x = e.offsetX;
      selectedItem.y = e.offsetY;

      draw();
    }
  });

  canvas.addEventListener("mouseup", () => {
    dragging = false;
    selectedItem = null;
  });

  // TOOLS

  window.instaColor = function(){
    showLoading();
    colorOn = true;
    draw();
  };

  window.setBrightness = function(value){
    showLoading();
    brightnessValue = value;
    draw();
  };

  window.addFrame = function(){
    showLoading();
    frameOn = true;
    draw();
  };

  window.resetImage = function(){

    showLoading();

    brightnessValue = 1;
    colorOn = false;
    frameOn = false;

    texts = [];
    stickers = [];

    draw();
  };

  window.vintage = function(){
    showLoading();
    draw("sepia(1)");
  };

  window.blurImg = function(){
    showLoading();
    draw("blur(3px)");
  };

  window.sharpen = function(){
    showLoading();
    draw("contrast(1.5)");
  };

  window.removeBackground = function(){

    showLoading();

    ctx.clearRect(0,0,canvas.width,canvas.height);

    const gradient = ctx.createLinearGradient(0,0,500,300);

    gradient.addColorStop(0,"#111");
    gradient.addColorStop(1,"#00ffd5");

    ctx.fillStyle = gradient;

    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.drawImage(img,50,20,400,260);

    draw();
  };

  window.enhanceImage = function(){
    showLoading();
    draw("contrast(1.4) saturate(1.5)");
  };

  // AI assistant

  aiAssistant.onclick = () => {

    const text = new SpeechSynthesisUtterance(
      "Hello. I am your AI restoration assistant."
    );

    window.speechSynthesis.speak(text);
  };

};
