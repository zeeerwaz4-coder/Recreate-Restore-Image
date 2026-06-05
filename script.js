const tools = document.getElementById("tools");

let isDown = false;
let startX;
let scrollLeft;

tools.addEventListener("mousedown", (e) => {
  isDown = true;
  startX = e.pageX - tools.offsetLeft;
  scrollLeft = tools.scrollLeft;
});

tools.addEventListener("mouseup", () => isDown = false);
tools.addEventListener("mouseleave", () => isDown = false);

tools.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - tools.offsetLeft;
  const walk = (x - startX) * 2;
  tools.scrollLeft = scrollLeft - walk;
});
