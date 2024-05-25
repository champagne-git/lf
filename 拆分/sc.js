const fs = require('fs')

const readFileAndParseData = filePath => {
    const data = fs
        .readFileSync(filePath, 'utf8')
        .split('\n')
        .filter(item => item.length != 0)
    const result = {}
    data.forEach(line => {
        const arr = line.split('\t')
        result[arr[0]] = arr[1]
    })
    return result
}

const readBuShou = filePath => {
    const data = fs
        .readFileSync(filePath, 'utf8')
        .split('\n')
        .filter(item => item.length != 0)
    return data.map(line => {
        const arr = line.split('\t')
        return {
            char: arr[0],
            bs: arr[1],
            strokes: arr[2],
            isStart: !(arr[3] == 1)
        }
    })
}

const writeToFile = (data, filePath) => {
    const result = data.map(item => {
        return `${item.char}\t${item.sm} ${item.bs} ${item.strokes[0]} ${item.strokes[1]} ${item.strokes[2]} ${item.strokes[3]}`
    })
    fs.writeFile(filePath, result.join('\n'), 'utf8', err => {
        if (err) {
            console.error('写入文件时出错:', err)
            return
        }
        console.log('文本文件已成功导出！')
    })
}

const generateOriginalChaiFen = (bhData, bsData, pyData) => {
    return bsData
        .map(item => {
            const bhItem = bhData[item.char]
            if (!bhItem) return

            let strokes = null
            const isSpecialBs = item.bs === '匚' || item.bs === '囗'

            if (!isSpecialBs) {
                strokes = item.isStart
                    ? bhItem.slice(-item.strokes).slice(0, 4)
                    : bhItem.slice(0, 4)
            } else {
                strokes =
                    item.bs === '匚'
                        ? bhItem.slice(1, -1).slice(0, 4)
                        : bhItem.slice(2, -1).slice(0, 4)
            }

            if (item.char === '匚') {
                strokes = '5'
            } else if (item.char === '囗') {
                strokes = '1'
            }

            while (strokes.length < 4) {
                strokes += strokes.charAt(strokes.length - 1)
            }

            return {
                char: item.char,
                sm: pyData[item.char],
                bs: item.bs,
                strokes
            }
        })
        .filter(Boolean)
}

const generateGuiBing = cf => {
    const gbData = require('./guibing.json')

    return cf.map(item => {
        for (const [key, values] of Object.entries(gbData)) {
            if (Array.isArray(values)) {
                if (values.includes(item.bs)) {
                    item.bs = key
                }
            } else {
                if (item.bs === values) {
                    item.bs = key
                }
            }
        }
        return item
    })
}

const main = () => {
    const biHuaData = readFileAndParseData('./bihua.txt')
    const pinYinData = readFileAndParseData('./pinyin.txt')
    const buShouData = readBuShou('./bushou.txt')
    const chaiFen = generateOriginalChaiFen(biHuaData, buShouData, pinYinData)
    const guiBing = generateGuiBing(generateOriginalChaiFen(biHuaData, buShouData, pinYinData))
    writeToFile(chaiFen, './cfb.txt')
    writeToFile(guiBing, './gb.txt')
}

main()
