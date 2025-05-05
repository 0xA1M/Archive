const btnClicked = document.querySelector("#bgChanger");
const tooltipWrapper = document.querySelector(".tooltip_wrapper");
const tooltip = document.querySelector(".content");
const soundEffect = new Audio("../audio/bg.mp3");

btnClicked.addEventListener("click", () => {
  let randomColor = Math.floor(Math.random() * 16777215).toString(16);
  tooltip.textContent = `Current Color is #${randomColor} !`;
  soundEffect.play();

  setTimeout(() => {
    document.body.style.backgroundColor = `#${randomColor}`;
    btnClicked.style.backgroundColor = `#${randomColor}`;
    tooltipWrapper.style.backgroundColor = `#${randomColor}`;
    document.body.classList.add("smooth_change");
  }, 500);
});
