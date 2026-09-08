// backend/utils/validation.js

const LIMITS = {
  SMALL_DESCRIPTION_MAX_WORDS: 30,
  DETAILED_DESCRIPTION_MAX_WORDS: 100
};

/**
 * Counts the number of words in a given text.
 * @param {string} text - The text to count words for.
 * @returns {number} The number of words.
 */
const getWordCount = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * Validates if the text exceeds the given word limit.
 * @param {string} text - The text to validate.
 * @param {number} limit - The maximum allowed words.
 * @returns {boolean} True if text is valid (within limit), false if it exceeds.
 */
const validateWordLimit = (text, limit) => {
  return getWordCount(text) <= limit;
};

module.exports = {
  LIMITS,
  getWordCount,
  validateWordLimit
};
