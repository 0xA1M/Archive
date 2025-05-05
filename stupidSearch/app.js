const submit = document.querySelector("#check");
let crack = new Audio("./sounds/crack.mp3");

submit.addEventListener("click", () => {
  crack.volume = 1;
  crack.play();
});
