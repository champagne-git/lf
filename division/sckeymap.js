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

const writeToFile = (data, filePath) => {
    const result = Object.keys(data).map(key => {
        try {
            return `${key}\t${data[key]}`
        } catch (err) {
            return
        }
    })
    fs.writeFile(filePath, result.join('\n'), 'utf8', err => {
        if (err) {
            console.error('写入文件时出错:', err)
            return
        }
        console.log('文本文件已成功导出！' + filePath)
    })
}

const generateKeymap = keymap => {
    const gbData = require('./guibing.json')

    const result = { ...keymap }

    for (const [key, values] of Object.entries(gbData)) {
        if (Array.isArray(values)) {
            values.forEach(item => {
                result[item] = result[key]
            })
        } else {
            result[values] = result[key]
        }
    }

    return result
}

const main = () => {
    const keymapData = readFileAndParseData('./keymap.txt')
    const keymap = generateKeymap(keymapData)
    writeToFile(keymap, './output_keymap.txt')
}

main()
