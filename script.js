window.onload = () => {

  const speech = new SpeechSynthesisUtterance("Welcome to Recreate and Restore");
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
  let texts = [];
  let stickers = [];

  let brightnessValue = 1;
  let colorOn = false;
  let frameOn = false;

  let selectedItem = null;
  let dragging = false;

  let offsetX = 0;
  let offsetY = 0;

  // HISTORY (ONLY ONCE)
  let history = [];
  let redoStack = [];

  // CROP
  let cropMode = false;
  let cropStartX = 0;
  let cropStartY = 0;
  let cropEndX = 0;
  let cropEndY = 0;

  function showLoading() {
    loading.style.display = "block";
    setTimeout(() => loading.style.display = "none", 1500);
  }

  function saveHistory() {

    const snapshot = {
      images: JSON.parse(JSON.stringify(images)),
      texts: JSON.parse(JSON.stringify(texts)),
      stickers: JSON.parse(JSON.stringify(stickers))
    };

    history.push(snapshot);

    if (history.length > 50) history.shift();

    redoStack = [];
  }

  function draw(customFilter = "") {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.filter = `brightness(${brightnessValue}) saturate(${colorOn ? 2 : 1}) ${customFilter}`;

    images.forEach(layer => {
      ctx.drawImage(layer.img, layer.x, layer.y, layer.width, layer.height);
    });

    if (frameOn) {
      ctx.strokeStyle = "#00ffd5";
      ctx.lineWidth = 10;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }

    texts.forEach(text => {
      ctx.save();
      ctx.translate(text.x, text.y);
      ctx.rotate(text.rotation * Math.PI / 180);
      ctx.font = `${text.size}px Arial`;
      ctx.fillStyle = "white";
      ctx.fillText(text.value, 0, 0);
      ctx.restore();
    });

    stickers.forEach(sticker => {
      ctx.save();
      ctx.translate(sticker.x, sticker.y);
      ctx.rotate(sticker.rotation * Math.PI / 180);
      ctx.font = `${sticker.size}px Arial`;
      ctx.fillText(sticker.value, 0, 0);
      ctx.restore();
    });

    // crop box
    if (cropMode) {
      ctx.strokeStyle = "#00ffd5";
      ctx.setLineDash([6]);
      ctx.strokeRect(cropStartX, cropStartY, cropEndX - cropStartX, cropEndY - cropStartY);
      ctx.setLineDash([]);
    }
  }

  // IMAGE UPLOAD
  input.addEventListener("change", function () {

    const files = Array.from(this.files);

    files.forEach(file => {

      const reader = new FileReader();

      reader.onload = function (e) {

        const img = new Image();

        img.onload = function () {

          canvas.width = 500;
          canvas.height = 300;

          images.push({
            type: "image",
            img,
            x: 0,
            y: 0,
            width: 300,
            height: 200
          });

          saveHistory();
          draw();
        };

        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    });
  });

  // TEXT
  window.addText = function () {

    const value = textInput.value;

    if (value.trim()) {

      texts.push({
        type: "text",
        value,
        x: 50,
        y: 50,
        size: 40,
        rotation: 0
      });

      saveHistory();
      draw();
    }
  };

  // STICKER
  window.addSticker = function () {

    stickers.push({
      type: "sticker",
      value: stickerSelect.value,
      x: 100,
      y: 100,
      size: 50,
      rotation: 0
    });

    saveHistory();
    draw();
  };

  // DELETE
  window.deleteSelected = function () {

    images = images.filter(i => i !== selectedItem);
    texts = texts.filter(i => i !== selectedItem);
    stickers = stickers.filter(i => i !== selectedItem);

    selectedItem = null;

    saveHistory();
    draw();
  };

  // BRING FRONT
  window.bringFront = function () {
    if (!selectedItem) return;

    if (selectedItem.type === "image") {
      images = images.filter(i => i !== selectedItem);
      images.push(selectedItem);
    }

    if (selectedItem.type === "text") {
      texts = texts.filter(i => i !== selectedItem);
      texts.push(selectedItem);
    }

    if (selectedItem.type === "sticker") {
      stickers = stickers.filter(i => i !== selectedItem);
      stickers.push(selectedItem);
    }

    draw();
  };

  // SEND BACK
  window.sendBack = function () {
    if (!selectedItem) return;

    if (selectedItem.type === "image") {
      images = images.filter(i => i !== selectedItem);
      images.unshift(selectedItem);
    }

    if (selectedItem.type === "text") {
      texts = texts.filter(i => i !== selectedItem);
      texts.unshift(selectedItem);
    }

    if (selectedItem.type === "sticker") {
      stickers = stickers.filter(i => i !== selectedItem);
      stickers.unshift(selectedItem);
    }

    draw();
  };

  // UNDO
  window.undoAction = function () {

    if (history.length > 1) {

      const current = history.pop();
      redoStack.push(current);

      const prev = history[history.length - 1];

      images = JSON.parse(JSON.stringify(prev.images));
      texts = JSON.parse(JSON.stringify(prev.texts));
      stickers = JSON.parse(JSON.stringify(prev.stickers));

      draw();
    }
  };

  // REDO
  window.redoAction = function () {

    if (redoStack.length > 0) {

      const state = redoStack.pop();
      history.push(state);

      images = JSON.parse(JSON.stringify(state.images));
      texts = JSON.parse(JSON.stringify(state.texts));
      stickers = JSON.parse(JSON.stringify(state.stickers));

      draw();
    }
  };

  // CROP
  window.activateCrop = () => cropMode = true;

  window.cancelCrop = () => {
    cropMode = false;
    draw();
  };

  window.applyCrop = function () {

    const w = cropEndX - cropStartX;
    const h = cropEndY - cropStartY;

    const temp = document.createElement("canvas");
    const tctx = temp.getContext("2d");

    temp.width = w;
    temp.height = h;

    tctx.drawImage(canvas, cropStartX, cropStartY, w, h, 0, 0, w, h);

    const img = new Image();

    img.onload = () => {

      images = [{
        type: "image",
        img,
        x: 0,
        y: 0,
        width: w,
        height: h
      }];

      canvas.width = w;
      canvas.height = h;

      cropMode = false;

      saveHistory();
      draw();
    };

    img.src = temp.toDataURL();
  };

  // MOUSE EVENTS
  canvas.addEventListener("mousedown", e => {

    const x = e.offsetX;
    const y = e.offsetY;

    selectedItem = null;

    if (cropMode) {
      cropStartX = x;
      cropStartY = y;
      cropEndX = x;
      cropEndY = y;
      dragging = true;
      return;
    }

    for (let i = images.length - 1; i >= 0; i--) {
      const l = images[i];

      if (x > l.x && x < l.x + l.width && y > l.y && y < l.y + l.height) {
        selectedItem = l;
        offsetX = x - l.x;
        offsetY = y - l.y;
        dragging = true;
        return;
      }
    }
  });

  canvas.addEventListener("mousemove", e => {

    if (cropMode && dragging) {
      cropEndX = e.offsetX;
      cropEndY = e.offsetY;
      draw();
      return;
    }

    if (dragging && selectedItem) {
      selectedItem.x = e.offsetX - offsetX;
      selectedItem.y = e.offsetY - offsetY;
      draw();
    }
  });

  canvas.addEventListener("mouseup", () => dragging = false);

};
