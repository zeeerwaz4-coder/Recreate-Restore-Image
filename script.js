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
