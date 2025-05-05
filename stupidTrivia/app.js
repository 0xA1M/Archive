const api_url = "https://opentdb.com/api.php?amount=1&type=multiple";
const question = document.querySelector("#multi");
const category = document.querySelector("#category");
const diff = document.querySelector("#diff");
const love = document.querySelector(".yeah");
const hate = document.querySelector(".nope");
const wrapper = document.querySelector(".wrapper");
const desire = document.querySelector("#desire");
const choice = document.querySelector(".choices");
const fart = new Audio("./sounds/fart.mp3");
const good = new Audio("./sounds/good.mp3");
const letsGo = new Audio("./sounds/lets_go.mp3");
const gone = new Audio("./sounds/gone.mp3");
let answers = [];

async function getData() {
  const response = await fetch(api_url);
  const data = await response.json();
  const iAnswer = data.results[0].incorrect_answers;
  const cAnswer = [data.results[0].correct_answer];
  answers = cAnswer.concat(iAnswer);
  function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
  }
  shuffle(answers);

  question.innerHTML = data.results[0].question;
  category.innerHTML = data.results[0].category;
  diff.innerHTML = data.results[0].difficulty;
  switch (data.results[0].difficulty) {
    case "easy":
      diff.style.color = "#00E851";
      break;
    case "medium":
      diff.style.color = "#FFC00F";
      break;
    case "hard":
      diff.style.color = "#FF1110";
      break;
  }

  answers.forEach((answer) => {
    const button = document.createElement("button");
    const correct = data.results[0].correct_answer;
    button.innerText = answer;
    button.classList.add("btn");
    choice.appendChild(button);

    if (button.innerText === correct) {
      button.setAttribute("id", "true");
    }

    let allBtn = document.getElementsByClassName("btn");
    button.addEventListener("click", function (e) {
      for (const btn of allBtn) {
        btn.classList.add("disable");
      }
      let selected = e.target;
      let value = selected.innerText;
      if (value == correct) {
        good.play();
        selected.classList.add("correct");
      } else {
        let cBtn = document.getElementById("true");
        fart.play();
        selected.classList.add("wrong");

        setTimeout(() => {
          cBtn.classList.add("correct");
          good.play();
        }, 1000);
      }
    });
  });
}

getData();

love.addEventListener("click", () => {
  const creator = document.querySelector("#creator");
  letsGo.play();
  wrapper.style.display = "none";
  document.body.style.backgroundColor = "black";
  document.body.classList.add("center");
  creator.style.display = "block";
  setTimeout(() => {
    document.body.classList.add("stage");
    desire.style.fontSize = "5rem";
    desire.innerText = "Thanks for playing";
    setTimeout(() => {
      desire.innerText = "💖";
      desire.style.fontSize = "28rem";
    }, 2000);
  }, 3000);
  setInterval(() => {
    document.body.style.display = "none";
    location.reload(true);
  }, 10000);
});

hate.addEventListener("click", () => {
  const remove = document.querySelector("#nope");
  const reloader = document.querySelector("#reloader");
  gone.play();
  setTimeout(() => {
    reloader.style.visibility = "hidden";
    remove.style.display = "none";
  }, 200);
});
