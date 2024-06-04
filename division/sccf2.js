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
        let str = `${item.char}\t${item.sm} ${item.bs}`
        for (let i = 0; i < 3; i++) {
            if (item.strokes[i]) {
                str += ` ${item.strokes[i]}`
            }
        }
        return str
    })
    fs.writeFile(filePath, result.join('\n'), 'utf8', err => {
        if (err) {
            console.error('写入文件时出错:', err)
            return
        }
        console.log('文本文件已成功导出！' + filePath)
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
                strokes = item.isStart ? bhItem.slice(-item.strokes) : bhItem
            } else {
                strokes = item.bs === '匚' ? bhItem.slice(1, -1) : bhItem.slice(2, -1)
            }

            if (item.char === '匚') {
                strokes = '5'
            } else if (item.char === '囗') {
                strokes = '1'
            } else if (item.char === '必') {
                strokes = '3'
            }

            // A -> 45
            // B -> 25
            // C -> 34 43
            // D -> 35 53
            // E -> 11
            strokes = strokes
                .replace(/45/g, 'A')
                .replace(/25/g, 'B')
                .replace(/34/g, 'C')
                .replace(/43/g, 'C')
                .replace(/35/g, 'D')
                .replace(/53/g, 'D')
                .replace(/11/g, 'E')

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
    const pinYinData = readFileAndParseData('./pinyin_gai.txt')
    const buShouData = readBuShou('./bushou.txt')
    const chaiFen = generateOriginalChaiFen(biHuaData, buShouData, pinYinData)
    const guiBing = generateGuiBing(generateOriginalChaiFen(biHuaData, buShouData, pinYinData))
    writeToFile(chaiFen, './output_cf.txt')
    writeToFile(guiBing, './output_gbcf.txt')
}

main()
