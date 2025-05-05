import "./styles/style.css";

const taskInput: HTMLInputElement = document.querySelector("#taskInput")!;
const addTaskBtn: HTMLButtonElement = document.querySelector("#addTaskBtn")!;
const taskList: HTMLUListElement = document.querySelector(".list")!;
document.querySelector(".taskOptionList")!;
const clearBtn: HTMLButtonElement = document.querySelector("#clearAllTasks")!;

let tasksCount: number = 0;
let tasksCompleted: number = 0;

function updateTaskCounter(): void {
  const inProgress = document.querySelector("#inProgress")! as HTMLSpanElement;
  inProgress.textContent = tasksCount.toString();
}

function completedTaskCounter(): void {
  const completedTasks = document.querySelector(
    "#completed"
  )! as HTMLSpanElement;
  completedTasks.textContent = tasksCompleted.toString();
}

function makeTaskElement(taskInputValue: string, taskCount: number): void {
  // Create the <li> element
  const taskItem: HTMLLIElement = document.createElement("li");
  taskItem.className = "task";
  taskItem.id = taskCount.toString();

  // Create the <p> element
  const taskName: HTMLParagraphElement = document.createElement("p");
  taskName.className = "taskName";
  taskName.textContent = taskInputValue;

  // Create the <div> for dotMenu
  const dotMenu: HTMLDivElement = document.createElement("div");
  dotMenu.className = "dotMenu";

  // Create the three <div> for the dots within the dotMenu
  // and append it to it.
  for (let i: number = 0; i < 3; i++) {
    const dot: HTMLDivElement = document.createElement("div");
    dot.className = "dot";
    dotMenu.append(dot);
  }

  // Create the <div> for taskOptionList
  const optionList: HTMLDivElement = document.createElement("div");
  optionList.className = "taskOptionList";

  // Create and append three <button> elements with SVG content
  const buttonIds: string[] = ["completedBtn", "removeBtn"];
  const buttonLabels: string[] = ["Mark task as completed", "Remove task"];
  const svgPaths: string[] = [
    "M4 12.6111L8.92308 17.5L20 6.5",
    "M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6",
  ]; // Replace with your SVG paths

  for (let i = 0; i < 2; i++) {
    const button: HTMLButtonElement = document.createElement("button");
    button.id = buttonIds[i];
    button.className = "btn";
    button.setAttribute("aria-label", buttonLabels[i]);

    // Create and append an <svg> element with the corresponding path
    const svg: SVGSVGElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    svg.setAttribute("width", "800px");
    svg.setAttribute("height", "800px");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");

    const path: SVGPathElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    path.setAttribute("d", svgPaths[i]);
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");

    svg.appendChild(path);
    button.appendChild(svg);
    optionList.appendChild(button);
  }

  // Append all elements to the <li> element
  taskItem.appendChild(taskName);
  taskItem.appendChild(dotMenu);
  taskItem.appendChild(optionList);

  // Add optionMenu animation to each task

  document.addEventListener("click", (event: MouseEvent): void => {
    if (taskItem.contains(event.target as HTMLElement)) {
      const dotMenu: HTMLDivElement = taskItem.querySelector(".dotMenu")!;
      const taskOptionList: HTMLDivElement =
        taskItem.querySelector(".taskOptionList")!;

      if (dotMenu.contains(event.target as HTMLElement)) {
        // Show Option Menu

        // Slide In
        taskOptionList.classList.remove("slideBack");
        taskOptionList.classList.add("slide");

        // Fade in
        dotMenu.classList.remove("fadeOut");
        dotMenu.classList.add("fadeIn");
        setTimeout((): void => {
          dotMenu.classList.add("hidden");
        }, 200);

        const completedTaskBtn = taskOptionList.querySelector(
          "#completedBtn"
        )! as HTMLButtonElement;
        const removeTaskBtn = taskOptionList.querySelector(
          "#removeBtn"
        )! as HTMLButtonElement;

        completedTaskBtn.addEventListener("click", (): void => {
          const taskItemName = taskItem.querySelector(
            ".taskName"
          )! as HTMLParagraphElement;
          taskItem.classList.add("completedTask");
          taskItemName.classList.add("completed");

          tasksCompleted++;
          completedTaskCounter();

          setTimeout(() => {
            completedTaskBtn.classList.add("hidden");
          }, 300);
        });

        removeTaskBtn.addEventListener("click", (): void => {
          taskItem.classList.add("fadeIn");
          let isCompleted: boolean =
            taskItem.classList.contains("completedTask");

          setTimeout(() => {
            taskList.removeChild(taskItem);

            if (tasksCount > 0) {
              tasksCount--;
              updateTaskCounter();
            }

            if (isCompleted) {
              tasksCompleted--;
              completedTaskCounter();
            }
          }, 500);
        });
      } else {
        // Hide Option Menu

        // Slide Out
        taskOptionList.classList.remove("slide");
        taskOptionList.classList.add("slideBack");

        // Fade out
        dotMenu.classList.remove("fadeIn");
        dotMenu.classList.add("fadeOut");
        dotMenu.classList.remove("hidden");
      }
    } else {
      // Hide All Option Menu

      for (let i: number = 0; i < taskList.children.length; i++) {
        const task = taskList.children[i] as HTMLLIElement;
        const dotMenu = task.querySelector(".dotMenu")! as HTMLDivElement;
        const taskOptionList = task.querySelector(
          ".taskOptionList"
        )! as HTMLDivElement;

        if (
          (dotMenu.classList.contains("hidden") ||
            dotMenu.classList.contains("hidden fadeIn")) &&
          taskOptionList.classList.contains("slide")
        ) {
          // Slide Out
          taskOptionList.classList.remove("slide");
          taskOptionList.classList.add("slideBack");

          // Fade out
          dotMenu.classList.remove("fadeIn");
          dotMenu.classList.add("fadeOut");
          dotMenu.classList.remove("hidden");
        }
      }
    }
  });

  // Append the <li> element to the <ul> (taskList)
  taskList.appendChild(taskItem);
}

addTaskBtn.addEventListener("click", (event: MouseEvent): void => {
  event.preventDefault();
  const taskInputValue: string = taskInput.value.trim();
  tasksCount++;
  updateTaskCounter();

  if (taskInputValue) {
    taskInput.value = "";

    makeTaskElement(taskInputValue, tasksCount);
  }
});

clearBtn.addEventListener("click", (): void => {
  while (taskList.firstChild) {
    taskList.removeChild(taskList.firstChild);
  }
  tasksCount = tasksCompleted = 0;
  updateTaskCounter();
  completedTaskCounter();
});
