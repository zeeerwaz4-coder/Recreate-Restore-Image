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

  function loadImage(file){
    const reader = new FileReader();

    reader.onload = function(e){
      img = new Image();

      img.onload = function(){

        canvas.width = 500;
        canvas.height = 300;

        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
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

};
