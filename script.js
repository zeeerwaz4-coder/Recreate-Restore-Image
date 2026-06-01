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

    // TEXT
    texts.forEach(text => {

      ctx.save();

      ctx.translate(text.x, text.y);
      ctx.rotate(text.rotation * Math.PI / 180);

      ctx.font = `${text.size}px Arial`;
      ctx.fillStyle = "white";

      ctx.fillText(text.value,0,0);

      ctx.restore();
    });

    // STICKERS
    stickers.forEach(sticker => {

      ctx.save();

      ctx.translate(sticker.x, sticker.y);
      ctx.rotate(sticker.rotation * Math.PI / 180);

      ctx.font = `${sticker.size}px Arial`;

      ctx.fillText(sticker.value,0,0);

      ctx.restore();
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
        y:50,
        size:40,
        rotation:0
      });

      draw();

      textInput.value = "";
    }
  };

  // STICKERS

  window.addSticker = function(){

    stickers.push({
      value:stickerSelect.value,
      x:100,
      y:100,
      size:50,
      rotation:0
    });

    draw();
  };

  // 🔥 RESIZE

  window.resizeObject = function(size){

    if(selectedItem){

      selectedItem.size = size;

      draw();
    }
  };

  // 🔥 ROTATE

  window.rotateObject = function(angle){

    if(selectedItem){

      selectedItem.rotation = angle;

      draw();
    }
  };

  // DRAG SYSTEM

  canvas.addEventListener("mousedown", (e) => {

    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    selectedItem = null;

    texts.forEach(text => {

      ctx.font = `${text.size}px Arial`;

      const width = ctx.measureText(text.value).width;

      if(
        mouseX >= text.x &&
        mouseX <= text.x + width &&
        mouseY <= text.y &&
        mouseY >= text.y - text.size
      ){
        selectedItem = text;
        dragging = true;
      }
    });

    stickers.forEach(sticker => {

      const width = sticker.size;

      if(
        mouseX >= sticker.x &&
        mouseX <= sticker.x + width &&
        mouseY <= sticker.y &&
        mouseY >= sticker.y - sticker.size
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
window.rotateObject = function(angle){

   // 🔥 DELETE SELECTED OBJECT

  window.deleteSelected = function(){

    if(selectedItem){

      texts = texts.filter(item => item !== selectedItem);

      stickers = stickers.filter(item => item !== selectedItem);

      selectedItem = null;

      draw();
    }
  };
