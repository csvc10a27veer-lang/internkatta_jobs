export const getShortDescription = (text, maxLength = 120) => {
    if (!text) return '';
    const trimmed = text.trim();
    if (trimmed.length <= maxLength) return trimmed;

    const truncated = trimmed.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    const result = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
    return `${result}...`;
};
