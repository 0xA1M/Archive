const text = document.querySelector("#text");
const btn = document.querySelector("#btn");

btn.addEventListener("click", function retry() {
  let userTextInput = prompt("Type Your Paragraph Here!");
  let userColorInput = prompt("Color?");

  if (userTextInput !== "") {
    text.innerHTML = userTextInput;
    text.style.color = userColorInput;
  } else {
    alert("Don't text field blank!");
    retry();
  }
});
