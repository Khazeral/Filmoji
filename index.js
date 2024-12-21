import { films } from "./filmList.js";
import { getLevenshteinDistance, getRandomInt } from "./utils.js";

const errorMessage = document.getElementById("error-message");
const scorePanel = document.getElementById('score')
const newInput = document.getElementById("prout")
let inputs = document.querySelectorAll("#input-box .letter-input");
let inputValues = [];
let playerScore = 0;
scorePanel.textContent = playerScore;

let movieSelected = "";

const getRandomMovie = () => {
  const pTitle = document.getElementById("film-title");
  if (pTitle) {
    const randomIndex = getRandomInt(films.length);
    movieSelected = films[randomIndex];
    pTitle.textContent = films[randomIndex].emoji;
  }
};

const validateButton = document.getElementById("validate-button");
const input = document.getElementById("input-answer");

const resetErrorMessage = () => {
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
  input.classList.remove("error"); 
};

const displaySuccessMessage = () => {
  errorMessage.textContent = "Bonne réponse !";
  errorMessage.classList.remove("hidden");
  errorMessage.style.color = "#1abc9c";
  setTimeout(() => {
    errorMessage.classList.add("hidden"); 
  }, 2000);
};

const displayInputBox = (movieName) => {
  const listCharacters = movieName.name.split(' ');

  const inputBox = document.getElementById('input-box');
  inputBox.innerHTML = ''; 

  for (let i = 0; i < listCharacters.length; i++) {
    let node = document.createElement("div");

    for (let j = 0; j < listCharacters[i].length; j++) {
      let input = document.createElement("input");
      input.addEventListener("input",()=>{
        if(input.value.length === 1){
          const nextInput = input.nextElementSibling;
          if (nextInput) {
            nextInput.focus();
          }
        }
      })
      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && input.value.length === 0) {
          const previousInput = input.previousElementSibling;
          if (previousInput) {
            previousInput.focus();
          }
        }
      });
      input.setAttribute("maxlength", "1"); 
      input.classList.add("letter-input");
      node.appendChild(input);
    }

    inputBox.appendChild(node);
  }

  inputs = document.querySelectorAll("#input-box .letter-input");
};


const checkAnswer = () => {
  inputValues = []; 

  inputs.forEach(input => {
    inputValues.push(input.value);
  });

  const answer = inputValues.join('');

  const distance = getLevenshteinDistance(answer.toLowerCase(), movieSelected.name.toLowerCase());

  if (distance > 3) {
    errorMessage.textContent = "Mauvaise réponse !";
    errorMessage.classList.remove("hidden");
    input.classList.add("shake");
    input.classList.add("error");

    setTimeout(() => input.classList.remove("shake"), 500);
    return false;
  }

  playerScore++;
  scorePanel.textContent = playerScore;
  displaySuccessMessage();
  return true;
};


const changeMovie = () => {
  const isGoodAnswer = checkAnswer();
  if (isGoodAnswer) {
    getRandomMovie();
  }
};



validateButton.addEventListener("click", () => {
  changeMovie();
});

getRandomMovie();
displayInputBox(movieSelected)
