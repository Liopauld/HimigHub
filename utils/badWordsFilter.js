const BAD_WORDS = [
  'damn', 'hell', 'crap', 'ass', 'bitch', 'bastard', 'fuck', 'shit',
  'dick', 'pussy', 'prick', 'asshole', 'motherfucker', 'wtf', 'stfu',
  'fag', 'slut', 'whore', 'retard', 'nigga', 'nigger',
];

const BAD_WORDS_REGEX = new RegExp(`\\b(${BAD_WORDS.join('|')})\\b`, 'gi');

export const filterBadWords = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text.replace(BAD_WORDS_REGEX, '***');
};

export const hasBadWords = (text) => {
  if (!text || typeof text !== 'string') return false;
  return BAD_WORDS_REGEX.test(text);
};

export const getCleanText = (text) => {
  return filterBadWords(text);
};
