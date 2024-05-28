const fs = require('fs')

// 读取并转换格式
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

// 生成
const generate = (char, wl) => {
    const dict = { ...wl }

    for (const key in char) {
        if (!dict[key]) {
            let shortLength = 2

            for (const k in dict) {
                if (char[key].slice(0, shortLength) === dict[k]) {
                    shortLength += 1
                }
            }

            dict[key] = char[key].slice(0, shortLength)
        }
    }

    return dict
}

const formatData = data => {
    return Object.keys(data).map(key => {
        try {
            return `${key}\t${data[key]}`
        } catch (err) {
            return
        }
    })
}

const writeToFile = (filePath, data) => {
    fs.writeFile(filePath, data.join('\n'), 'utf8', err => {
        if (err) {
            console.error('写入文件时出错:', err)
            return
        }
        console.log('文本文件已成功导出！' + filePath)
    })
}

const main = () => {
    const char = readFileAndParseData('../chai/characters.txt')
    const wl = readFileAndParseData('./wlm.txt')
    const dict = generate(char, wl)
    const formattedData = formatData(dict)
    writeToFile('./output_mb.txt', formattedData)
}

main()
