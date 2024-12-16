import {films} from "./filmList.js";
import {getRandomInt} from "./utils.js";

let movieSelected = ""

const getRandomMovie = () => {
  const pTitle = document.getElementById("film-title");

  if (pTitle) {
    const randomIndex = getRandomInt(films.length);
    movieSelected = films[randomIndex]
    pTitle.textContent = films[randomIndex].emoji;
  }
};

getRandomMovie()