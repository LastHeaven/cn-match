const simplified = require('./simplified')

const noMatchChar = new Set(['i', 'u', 'v'])
const topChar = new Set(['b', 'c', 'd', 'f', 'j', 'k', 'l', 'm', 'p', 'q', 'r', 's', 't', 'w', 'x', 'y', 'z'])
const topChar2 = new Set(['h', 'n', 'g'])
const specialChar = {
  // ua, ia
  'a': new Set(['u', 'i']),
  // ie, ue, ve, er
  'e': new Set(['i', 'u', 'v', 'r']),
  // ai, ei, ui, 触发noMatch规则
  'i': new Set(['a', 'e', 'u']),
  // ao, uo
  'o': new Set(['a', 'u', 'i']),
  // ou, iu, 触发noMatch规则
  'u': new Set(['o', 'i'])
}

const specialChar2 = {
  // zh, ch, sh
  'h': new Set(['z', 'c', 's']),
  'n': new Set(['a', 'o', 'i', 'e', 'u']),
  'g': new Set(['n'])
}

// const specialChar3 = {
//   'n': {
//     // an,en,in,un,ang,eng,ing,ong
//     pre: new Set(['a', 'o', 'i', 'e', 'u']),
//     after: new Set(['g']),
//     exclude: new Set(['on', 'ung'])
//   }
// }

// 树行结构
/**
 * 比如 kang,可以匹配上 看安南宫
 * 数组第一项是连词,后几项是分词
 * k -> ka -> kan -> kang -> null
 *                -> g -> null
 *
 *         -> n  -> null
 *               -> g -> null
 *
 *   -> a -> an -> ang -> null
 *              -> g -> null
 *
 *        -> n -> null -> null
 *             -> g -> null
 *
 * [k,o,n,g]
 * 简单分词，可以优化
 * [false, true, true, true]
 */
const divideChar = (chars) => {
  if (!chars) {
    return []
  }
  // 为true则可以连词
  const results = [false]
  const arr = chars.split('')
  const len = arr.length
  let fChar = arr[0]
  let fTop = topChar.has(fChar) || topChar2.has(fChar)
  for (let i = 1; i < len; i++) {
    const sChar = arr[i]
    let isTopChar = topChar.has(sChar)
    if (isTopChar) {
      results.push(false)
    } else {
      const sp1 = specialChar[sChar]
      if (sp1) {
        if (fTop) {
          results.push(true)
        } else {
          results.push(sp1.has(fChar))
        }
      } else {
        const sp2 = specialChar2[sChar]
        if (sp2) {
          isTopChar = true
          results.push(sp2.has(fChar))
        } else {
          results.push(false)
        }
      }
    }
    fChar = sChar
    fTop = isTopChar
  }
  return results
}

const matchedText = (text, search) => {
  let start = 0
  let end = 0
  /**
   * 先匹配第一个字，匹配上了
   * 再匹配第二个字
   * 若无法匹配，则第一个字再匹配一次
   * 若无法匹配则把第二个字当成第一个字匹配
   * 若匹配上了则继续匹配
   *
   * match(原文, 要匹配的拼音, 拼音分词, 已经是第几个字了, 原文总长， 已经是拼音的第几个字了，拼音总长)
   */
  const match = (text, search, divide, textId, textLen, searchId, searchLen) => {
    if (searchId === searchLen) {
      end = textId
      return true
    }
    if (textId === textLen) {
      return false
    }
    const char = text[textId]
    let pinyin = simplified[char]
    let toDoChar
    if (pinyin) {
      toDoChar = [...pinyin.split(' '), char]
    } else {
      toDoChar = [char]
    }
    const fSChar = search[searchId]
    const matcheds = toDoChar.filter(char => char.startsWith(fSChar)) || []
    if (matcheds.length > 0) {
      if (match (text, search, divide, textId + 1, textLen, searchId + 1, searchLen)) {
        return true
      }
    }
    for (let mi = 0; mi < matcheds.length; mi++) {
      const matched = matcheds[mi]
      let j = 1
      for (let i = searchId + 1; i < searchLen; i++) {
        if (divide[i] && matched[j] === search[i]) {
          if (match (text, search, divide, textId + 1, textLen, searchId + j + 1, searchLen)) {
            return true
          }
          j++
        } else {
          break
        }
      }
    }

    if (searchId === 0) {
      start = textId + 1
      return match (text, search, divide, textId + 1, textLen, 0, searchLen)
    } else {
      return false
    }
  }
  if (match(text, search, divideChar(search), 0, text.length, 0, search.length)) {
    return [start, end]
  } else {
    return null
  }
}

const text = '还是'

console.log(matchedText(text, 'huan'))
console.log(matchedText(text, 'hai'))
console.log(matchedText(text, 'hs'))
console.log(matchedText(text, 's'))
