// import { dict } from './simplified_dict'
const dict = require('./simplified_dict')

function parseDict(dict) {
    let parseDict = {}
    for (let i in dict) {
        let temp = dict[i]
        for (let j = 0, len = temp.length; j < len; j++) {
            if (!parseDict[temp[j]]) {
                parseDict[temp[j]] = i
            } else {
                parseDict[temp[j]] = parseDict[temp[j]] + ' ' + i
            }
        }
    }
    return parseDict
}


// var pinyin = {
//     match: parseDict(dict)
// }
//
// console.log(pinyin.match['长'])

module.exports = parseDict(dict)
// export default pinyin
