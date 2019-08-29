const levenshteinDistance = require('fast-levenshtein').get

const isString = (s) => s && (typeof s == 'string') && s.length > 0

const nearestKeywords = (keyword, k, vocabulary) => {
  if (!isString(keyword))
    throw new Error('DomainError - keyword must be string w/ length > 0')

  if (Number.isNaN(Number.parseInt(k)) || k < 1)
    throw new Error('DomainError - k must be int >= 1')

  if (!vocabulary || !Array.isArray(vocabulary) || vocabulary.some(s => !isString(s)))
    throw new Error('DomainError - vocabulary must be an Array of strings')

  return vocabulary
    .map(word => { return { word, distance: levenshteinDistance(keyword, word) } })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k)
}

module.exports = nearestKeywords
