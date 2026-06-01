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

  let images = [];

  let brightnessValue = 1;
  let colorOn = false;
  let frameOn = false;

  let texts = [];
  let stickers = [];

  let selectedItem = null;
  let dragging = false;
  // 🔥 HISTORY SYSTEM

  let history = [];
  let redoStack = [];

  let offsetX = 0;
  let offsetY = 0;

  function showLoading(){

    loading.style.display = "block";

    setTimeout(() => {
      loading.style.display = "none";
    },1500);
  } 
  // 🔥 SAVE HISTORY

  function saveHistory(){

    const snapshot = {
      images: JSON.parse(JSON.stringify(images)),
      texts: JSON.parse(JSON.stringify(texts)),
      stickers: JSON.parse(JSON.stringify(stickers))
    };

    history.push(snapshot);

    if(history.length > 50){
      history.shift();
    }

    redoStack = [];
  }
  // 🔥 UNDO

  window.undoAction = function(){

    if(history.length > 1){

      const current = history.pop();

      redoStack.push(current);

      const previous = history[history.length - 1];

      images = JSON.parse(JSON.stringify(previous.images));
      texts = JSON.parse(JSON.stringify(previous.texts));
      stickers = JSON.parse(JSON.stringify(previous.stickers));

      redrawImages();

      draw();
    }
  };

  // 🔥 REDO

  window.redoAction = function(){

    if(redoStack.length > 0){

      const restored = redoStack.pop();

      history.push(restored);

      images = JSON.parse(JSON.stringify(restored.images));
      texts = JSON.parse(JSON.stringify(restored.texts));
      stickers = JSON.parse(JSON.stringify(restored.stickers));

      redrawImages();

      draw();
    }
  };

  function draw(customFilter = ""){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.filter = `
      brightness(${brightnessValue})
      saturate(${colorOn ? 2 : 1})
      ${customFilter}
    `;

    // 🔥 DRAW IMAGE LAYERS
    images.forEach(layer => {

      ctx.drawImage(
        layer.img,
        layer.x,
        layer.y,
        layer.width,
        layer.height
      );
    });

    // frame
    if(frameOn){
      ctx.strokeStyle = "#00ffd5";
      ctx.lineWidth = 10;
      ctx.strokeRect(0,0,canvas.width,canvas.height);
    }

    // TEXTS
    texts.forEach(text => {

      ctx.save();

      ctx.translate(text.x,text.y);

      ctx.rotate(text.rotation * Math.PI / 180);

      ctx.font = `${text.size}px Arial`;

      ctx.fillStyle = "white";

      ctx.fillText(text.value,0,0);

      ctx.restore();
    });

    // STICKERS
    stickers.forEach(sticker => {

      ctx.save();

      ctx.translate(sticker.x,sticker.y);

      ctx.rotate(sticker.rotation * Math.PI / 180);

      ctx.font = `${sticker.size}px Arial`;

      ctx.fillText(sticker.value,0,0);

      ctx.restore();
    });
  }

  // LOAD IMAGES

  input.addEventListener("change", function(){

    const files = Array.from(this.files);

    files.forEach(file => {

      const reader = new FileReader();

      reader.onload = function(e){

        const img = new Image();

        img.onload = function(){

          canvas.width = 500;
          canvas.height = 300;

          images.push({
            type:"image",
            img:img,
            x:0,
            y:0,
            width:300,
            height:200
          });

          draw();
        };

        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    });
  });

  // TEXT

  window.addText = function(){

    const value = textInput.value;

    if(value.trim() !== ""){

      texts.push({
        type:"text",
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
      type:"sticker",
      value:stickerSelect.value,
      x:100,
      y:100,
      size:50,
      rotation:0
    });

    draw();
  };

  // RESIZE

  window.resizeObject = function(size){

    if(selectedItem){

      if(selectedItem.type === "image"){

        selectedItem.width = size * 5;
        selectedItem.height = size * 3;
      }
      else{
        selectedItem.size = size;
      }

      draw();
    }
  };

  // ROTATE

  window.rotateObject = function(angle){

    if(selectedItem && selectedItem.type !== "image"){

      selectedItem.rotation = angle;

      draw();
    }
  };

  // DELETE

  window.deleteSelected = function(){
    // 🔥 BRING TO FRONT

  window.bringFront = function(){

    if(selectedItem){

      // IMAGE
      if(selectedItem.type === "image"){

        images = images.filter(
          item => item !== selectedItem
        );

        images.push(selectedItem);
      }

      // TEXT
      if(selectedItem.type === "text"){

        texts = texts.filter(
          item => item !== selectedItem
        );

        texts.push(selectedItem);
      }

      // STICKER
      if(selectedItem.type === "sticker"){

        stickers = stickers.filter(
          item => item !== selectedItem
        );

        stickers.push(selectedItem);
      }

      draw();
    }
  };

  // 🔥 SEND TO BACK

  window.sendBack = function(){

    if(selectedItem){

      // IMAGE
      if(selectedItem.type === "image"){

        images = images.filter(
          item => item !== selectedItem
        );

        images.unshift(selectedItem);
      }

      // TEXT
      if(selectedItem.type === "text"){

        texts = texts.filter(
          item => item !== selectedItem
        );

        texts.unshift(selectedItem);
      }

      // STICKER
      if(selectedItem.type === "sticker"){

        stickers = stickers.filter(
          item => item !== selectedItem
        );

        stickers.unshift(selectedItem);
      }

      draw();
    }
  };

    if(selectedItem){

      images = images.filter(item => item !== selectedItem);

      texts = texts.filter(item => item !== selectedItem);

      stickers = stickers.filter(item => item !== selectedItem);

      selectedItem = null;

      draw();
    }
  };

  // 🔥 DRAG SYSTEM

  canvas.addEventListener("mousedown", (e) => {

    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    selectedItem = null;

    // CHECK IMAGE LAYERS
    for(let i = images.length - 1; i >= 0; i--){

      const layer = images[i];

      if(
        mouseX >= layer.x &&
        mouseX <= layer.x + layer.width &&
        mouseY >= layer.y &&
        mouseY <= layer.y + layer.height
      ){

        selectedItem = layer;

        offsetX = mouseX - layer.x;
        offsetY = mouseY - layer.y;

        dragging = true;

        return;
      }
    }

    // CHECK TEXTS
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

        offsetX = mouseX - text.x;
        offsetY = mouseY - text.y;

        dragging = true;
      }
    });

    // CHECK STICKERS
    stickers.forEach(sticker => {

      if(
        mouseX >= sticker.x &&
        mouseX <= sticker.x + sticker.size &&
        mouseY <= sticker.y &&
        mouseY >= sticker.y - sticker.size
      ){

        selectedItem = sticker;

        offsetX = mouseX - sticker.x;
        offsetY = mouseY - sticker.y;

        dragging = true;
      }
    });
  });

  canvas.addEventListener("mousemove", (e) => {

    if(dragging && selectedItem){

      selectedItem.x = e.offsetX - offsetX;
      selectedItem.y = e.offsetY - offsetY;

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

    images = [];
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
