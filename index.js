import { films } from "./filmList.js";
import { getLevenshteinDistance, getRandomInt } from "./utils.js";

const errorMessage = document.getElementById("error-message");
const scorePanel = document.getElementById('score')
let playerScore = 0;
scorePanel.textContent = playerScore

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
};

const checkAnswer = () => {
  const distance = getLevenshteinDistance(input.value, movieSelected.name);

  if (distance > 3) {
    console.log("pas bon")
    errorMessage.textContent = "C'est pas bon";
    errorMessage.classList.remove("hidden");
    return false;
  }
  scorePanel.textContent = playerScore+1
  return true;
};

const changeMovie = () => {
  const isGoodAnswer = checkAnswer();
  if (isGoodAnswer) {
    getRandomMovie();
  }
};

input.addEventListener("click", () => {
  resetErrorMessage();
});

validateButton.addEventListener("click", () => {
  changeMovie();
});

getRandomMovie();
