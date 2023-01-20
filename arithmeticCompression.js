/**
 * arithmeticCompression.js
 * ------------------------
 * Simple arithmetic compression
 * 
 * References:
 *  - https://en.wikipedia.org/wiki/Arithmetic_coding
 *  - https://michaeldipperstein.github.io/arithmetic.html
 * 
 * Author: Oscar Jaimes
 * Date: January 19th, 2023
 */


/**
* Encodes a string using arithmetic compression using pre determined probability table
* @param {String} inputStream
* @param {Object} probabilityTable
*/
const encode = (inputStream, probabilityTable) => {
  const tokens = Array.from(inputStream)

  let lowerBound = 0;
  let upperBound = 1;


  while (tokens.length > 0) {
    const rangeTable = buildRangeTable(probabilityTable, lowerBound, upperBound);
    const currentToken = tokens.shift();
    const newRange = rangeTable[currentToken];
    lowerBound = newRange[0];
    upperBound = newRange[1]
  }

  return (upperBound + lowerBound) / 2;
};

/**
 * Decodes an arithmetic code number using pre determined probability table
 * @param {Number} encodedValue 
 * @param {Object} probabilityTable 
 * @param {Number} symbolCount 
 * @returns 
 */
const decode = (encodedValue, probabilityTable, symbolCount) => {
  let decodedStr = '';
  let lowerBound = 0;
  let upperBound = 1;

  let currentEncodedValue = encodedValue;

  while (decodedStr.length != symbolCount) {
    const rangeTable = buildRangeTable(probabilityTable, lowerBound, upperBound);
    const token = encodedValueToToken(currentEncodedValue, rangeTable);

    lowerBound = rangeTable[token][0],
    upperBound = rangeTable[token][1]
    
    decodedStr += token;
  }

  return decodedStr;
};

/**
 * Maps an arithmetic code value to its appropraite character in a 
 * dictionary mapping characters to probabilty ranges
 * 
 * @param {Number} encodedValue 
 * @param {Object} rangeTable 
 * @returns {String}
 */
const encodedValueToToken = (encodedValue, rangeTable) => {
  let targetChar = '';

  for (const [char, range] of Object.entries(rangeTable)) {
    if (encodedValue > range[0] && encodedValue < range[1]) {
      targetChar = char;
      break;
    }
  }

  return targetChar;
}

/**
 * Builds a table mapping tokens -> probabilities based on input stream
 * @param {String} stream 
 * @returns {Object}
 */
const buildProbabilityTable = (stream) => {
  const freqs = {};
  for (const char of stream) {
    if (freqs[char]) {
      freqs[char] += 1;
    } else {
      freqs[char] = 1;
    }
  }

  const probs = {};
  for (const [char, freq] of Object.entries(freqs)) {
    probs[char] = freq / stream.length;
  }

  return probs;
};


/**
 * Builds a table mapping characters to probability ranges based on an upper and lower bound
 * and pre determined probability table
 * 
 * @param {Object} probabilityTable 
 * @param {Number} lowerBound 
 * @param {Number} upperBound 
 * @returns {Object}
 */
const buildRangeTable = (probabilityTable, lowerBound, upperBound) => {
  const rangeTable = {};
  const range = upperBound - lowerBound;
  let currentLowerBound = lowerBound;

  for (const [char, prob] of Object.entries(probabilityTable)) {
    rangeTable[char] = [currentLowerBound, currentLowerBound + (range * prob)]
    currentLowerBound += range * prob;
  }

  return rangeTable;
};


/**
 * Helper for reading user input
 */
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});


/**
 * Run the program via command line
 */
const driver = () => {
  readline.question("Please enter a stream of characters to encode: ", (stream) => {
    const probabilityTable = buildProbabilityTable(stream);
    const encodedValue = encode(stream, probabilityTable);
    console.log(`The artihmetic encoded value is: ${encodedValue}`);

    const symbolCount = stream.length;
    const decoded = decode(encodedValue, probabilityTable, symbolCount);

    console.log(`The decoded string is: ${decoded}`);

  });
};

driver();
