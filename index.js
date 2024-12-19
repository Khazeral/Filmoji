import {films} from "./filmList.js";
import {getLevenshteinDistance, getRandomInt} from "./utils.js";

let movieSelected = ""

const moviesToGuess = films

const getRandomMovie = () => {
  const pTitle = document.getElementById("film-title");
  if (pTitle) {
    const randomIndex = getRandomInt(films.length);
    movieSelected = films[randomIndex]
    pTitle.textContent = films[randomIndex].emoji;
  }
};

const validateButton = document.getElementById("validate-button")
const input = document.getElementById("input-answer")

const checkAnswer = () => {
   const distance = getLevenshteinDistance(input.value, movieSelected.name)

   if(distance > 3 ){
    console.log("non")
   }
}
validateButton.addEventListener(
  "click",
  () => {
    checkAnswer
  }
);

getRandomMovie()
