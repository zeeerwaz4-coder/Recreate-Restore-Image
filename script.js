window.onload = () => {

  // =====================
  // INIT
  // =====================
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

  // =====================
  // DATA LAYERS
  // =====================
  let images = [];
  let texts = [];
  let stickers = [];

  // =====================
  // SETTINGS
  // =====================
  let brightnessValue = 1;
  let colorOn = false;
  let frameOn = false;

  let snap = 10;

  // =====================
  // INTERACTION STATE
  // =====================
  let selectedItem = null;
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  // =====================
  // HISTORY SYSTEM
  // =====================
  let history = [];
  let redoStack = [];

  // =====================
  // CROP SYSTEM
  // =====================
  let cropMode = false;
  let cropStartX = 0;
  let cropStartY = 0;
  let cropEndX = 0;
  let cropEndY = 0;

  // =====================
  // UTIL
  // =====================
  function showLoading() {
    loading.style.display = "block";
    setTimeout(() => loading.style.display = "none", 1200);
  }

  function snapValue(v) {
    return Math.round(v / snap) * snap;
  }

  function saveHistory() {
    history.push({
      images: JSON.parse(JSON.stringify(images)),
      texts: JSON.parse(JSON.stringify(texts)),
      stickers: JSON.parse(JSON.stringify(stickers))
    });

    if (history.length > 50) history.shift();
    redoStack = [];
  }

  // =====================
  // DRAW ENGINE
  // =====================
  function draw(customFilter = "") {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.filter = `brightness(${brightnessValue}) saturate(${colorOn ? 2 : 1}) ${customFilter}`;

    // IMAGES
    images.forEach(img => {
      ctx.drawImage(img.img, img.x, img.y, img.width, img.height);
    });

    // FRAME
    if (frameOn) {
      ctx.strokeStyle = "#00ffd5";
      ctx.lineWidth = 8;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }

    // TEXT
    texts.forEach(t => {
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(t.rotation * Math.PI / 180);
      ctx.font = `${t.size}px Arial`;
      ctx.fillStyle = "white";
      ctx.fillText(t.value, 0, 0);
      ctx.restore();
    });

    // STICKERS
    stickers.forEach(s => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation * Math.PI / 180);
      ctx.font = `${s.size}px Arial`;
      ctx.fillText(s.value, 0, 0);
      ctx.restore();
    });

    // CROPPING BOX
    if (cropMode) {
      ctx.strokeStyle = "#00ffd5";
      ctx.setLineDash([6]);
      ctx.strokeRect(
        cropStartX,
        cropStartY,
        cropEndX - cropStartX,
        cropEndY - cropStartY
      );
      ctx.setLineDash([]);
    }

    // SELECTION HIGHLIGHT
    if (selectedItem) {
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);

      let x = selectedItem.x;
      let y = selectedItem.y;
      let w = selectedItem.width || selectedItem.size || 50;
      let h = selectedItem.height || selectedItem.size || 50;

      ctx.strokeRect(x - 5, y - 5, w + 10, h + 10);

      ctx.setLineDash([]);
    }
  }

  // =====================
  // IMAGE UPLOAD
  // =====================
  input.addEventListener("change", function () {

    Array.from(this.files).forEach(file => {

      const reader = new FileReader();

      reader.onload = e => {

        const img = new Image();

        img.onload = () => {

          canvas.width = rect.width;
          canvas.height = rect.height;

          images.push({
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

  // =====================
  // TEXT
  // =====================
  window.addText = () => {

    const value = textInput.value;
    if (!value.trim()) return;

    texts.push({
      value,
      x: 50,
      y: 50,
      size: 40,
      rotation: 0
    });

    saveHistory();
    draw();
  };

  // =====================
  // STICKER
  // =====================
  window.addSticker = () => {

    stickers.push({
      value: stickerSelect.value,
      x: 100,
      y: 100,
      size: 50,
      rotation: 0
    });

    saveHistory();
    draw();
  };

  // =====================
  // DELETE
  // =====================
  window.deleteSelected = () => {

    images = images.filter(i => i !== selectedItem);
    texts = texts.filter(t => t !== selectedItem);
    stickers = stickers.filter(s => s !== selectedItem);

    selectedItem = null;

    saveHistory();
    draw();
  };

  // =====================
  // HISTORY
  // =====================
  window.undoAction = () => {

    if (history.length > 1) {

      redoStack.push(history.pop());

      const prev = history[history.length - 1];

      images = JSON.parse(JSON.stringify(prev.images));
      texts = JSON.parse(JSON.stringify(prev.texts));
      stickers = JSON.parse(JSON.stringify(prev.stickers));

      draw();
    }
  };

  window.redoAction = () => {

    if (redoStack.length > 0) {

      const state = redoStack.pop();
      history.push(state);

      images = JSON.parse(JSON.stringify(state.images));
      texts = JSON.parse(JSON.stringify(state.texts));
      stickers = JSON.parse(JSON.stringify(state.stickers));

      draw();
    }
  };

  // =====================
  // CROP CONTROL
  // =====================
  window.activateCrop = () => cropMode = true;

  window.cancelCrop = () => {
    cropMode = false;
    draw();
  };

  window.applyCrop = () => {

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

  // =====================
  // MOUSE SYSTEM (CLEAN)
  // =====================
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

      if (
        x > l.x &&
        x < l.x + l.width &&
        y > l.y &&
        y < l.y + l.height
      ) {
        selectedItem = l;
        offsetX = x - l.x;
        offsetY = y - l.y;
        dragging = true;
        return;
      }
    }
  });

  canvas.addEventListener("mousemove", e => {

    const x = e.offsetX;
    const y = e.offsetY;

    if (cropMode && dragging) {
      cropEndX = x;
      cropEndY = y;
      draw();
      return;
    }

    if (dragging && selectedItem) {
      selectedItem.x = snapValue(x - offsetX);
      selectedItem.y = snapValue(y - offsetY);
      draw();
    }
  });

  canvas.addEventListener("mouseup", () => dragging = false);

  // =====================
  // AI ASSISTANT
  // =====================
  aiAssistant.onclick = () => {

    const t = new SpeechSynthesisUtterance(
      "Hello. I am your AI restoration assistant."
    );

    window.speechSynthesis.speak(t);
  };

};
