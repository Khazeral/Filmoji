export const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};


const initiateMatrix = (firstWord, secondWord) => {
  const rows = firstWord.length;
  const cols = secondWord.length;
  const matrix = [];

  for (let i = 0; i <= rows; i++) {
    matrix[i] = new Array(cols + 1).fill(0);

    if (i === 0) {
      for (let j = 0; j <= cols; j++) {
        matrix[i][j] = j;
      }
    } else {
      matrix[i][0] = i;
    }
  }

  return matrix;
};

const fillMatrix = (matrix, firstWord, secondWord) => {
  const str1 = firstWord;
  const str2 = secondWord;

  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i][j - 1] + 1,
        matrix[i - 1][j] + 1,
        matrix[i - 1][j - 1] + cost 
      );
    }
  }

  return matrix;
};

export const getLevenshteinDistance = (firstWord, secondWord) => {
  const matrix = initiateMatrix(firstWord, secondWord);
  const filledMatrix = fillMatrix(matrix, firstWord, secondWord);
  return filledMatrix[firstWord.length][secondWord.length];
};

