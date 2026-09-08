// frontend/src/utils/validation.js

export const LIMITS = {
  SMALL_DESCRIPTION_MAX_WORDS: 30,
  DETAILED_DESCRIPTION_MAX_WORDS: 100
};

/**
 * Counts the number of words in a given text.
 * @param {string} text - The text to count words for.
 * @returns {number} The number of words.
 */
export const getWordCount = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * Validates if the text exceeds the given word limit.
 * @param {string} text - The text to validate.
 * @param {number} limit - The maximum allowed words.
 * @returns {boolean} True if text is valid (within limit), false if it exceeds.
 */
export const validateWordLimit = (text, limit) => {
  return getWordCount(text) <= limit;
};

/**
 * Trims a given text to the specified word limit.
 * Useful when pasting text into a field.
 * @param {string} text - The text to trim.
 * @param {number} limit - The maximum allowed words.
 * @returns {string} The trimmed text.
 */
export const trimToWordLimit = (text, limit) => {
  if (!text) return text;
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(' ');
};
