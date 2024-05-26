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
        return `${item.char}\t${item.bs}\t${item.strokes}\t${item.isStart ? 0 : 1}`
    })
    fs.writeFile(filePath, result.join('\n'), 'utf8', err => {
        if (err) {
            console.error('写入文件时出错:', err)
            return
        }
        console.log('文本文件已成功导出！')
    })
}

const generateOriginalChaiFen = (bhData, bsData, zgData) => {
    return bsData
        .map(item => {
            if (!item.isStart) return item

            const bhItem = bhData[item.char]
            let strokes = 0
            const isSpecialBs = item.bs === '匚' || item.bs === '囗'

            if (!isSpecialBs) {
                strokes = bhItem.slice(zgData[item.bs].length).length
            } else {
                strokes = item.bs === '匚' ? bhItem.slice(1, -1).length : bhItem.slice(2, -1).length
            }

            const specialChar = ['即', '既', '暨']

            if (specialChar.includes(item.char)) {
                strokes = bhItem.slice(5).length
            }

            if (strokes == 0) {
                strokes = 1
            }

            return {
                char: item.char,
                bs: item.bs,
                strokes,
                isStart: item.isStart
            }
        })
        .filter(Boolean)
}

const main = () => {
    const biHuaData = readFileAndParseData('./bihua.txt')
    const ziGenData = readFileAndParseData('./zigen.txt')
    const buShouData = readBuShou('./bushou_old.txt')
    const chaiFen = generateOriginalChaiFen(biHuaData, buShouData, ziGenData)
    writeToFile(chaiFen, './output_bs.txt')
}

main()
