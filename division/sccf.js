const fs = require('fs')

/**
 * 读取文件
 * @param {String} filePath 读取路径
 * @returns Object 结果
 */
const readFileAndParseData = filePath => {
    const data = fs.readFileSync(filePath, 'utf8')
    const lines = data.split(/\r?\n/)
    const result = {}

    lines.forEach(line => {
        if (line.trim().length > 0) {
            const parts = line.split('\t')
            const key = parts[0]
            const value = parts.length > 2 ? parts.slice(1) : parts[1]
            result[key] = value
        }
    })

    return result
}

/**
 * 导出文件
 * @param {Array} data 导出的数组
 * @param {String} filePath 导出路径
 * @param {Function} formatter 格式化函数
 */
const writeToFile = (data, filePath, formatter) => {
    const result = data.map(formatter)
    fs.writeFile(filePath, result.join('\n'), 'utf8', err => {
        if (err) {
            console.error('写入文件时出错:', err)
            return
        }
        console.log('文本文件已成功导出！' + filePath)
    })
}

// 汉字笔画数据
const biHuaData = readFileAndParseData('./info/bihua.txt')
// 字根数据
const ziGenData = readFileAndParseData('./info/zigen.txt')
// 部首信息
const buShouData = readFileAndParseData('./info/bushou.txt')
// 拼音信息
const duYinData = readFileAndParseData('./info/duyin2.txt')

// 生成所需要的声母
const shengMu = Object.entries(duYinData).map(([char, value]) => {
    const processItem = item => {
        let res = `sm-${item[0]}`

        const aoe = /^[aoe]/
        if (aoe.test(item)) {
            res = 'sm-0'
        } else {
            const h = /^(zh|ch|sh)/
            const yu = /^yu/
            const yi = /^y(?!u)/

            if (h.test(item)) {
                res = `sm-${item.match(h)[0]}`
            } else if (yu.test(item)) {
                res = `sm-${item.match(yu)[0]}`
            } else if (yi.test(item)) {
                res = 'sm-yi'
            }
        }
        return res
    }

    let newValue = null

    if (Array.isArray(value)) {
        const processedValues = Array.from(new Set(value.map(processItem))) // 去除重复项
        newValue = processedValues.length === 1 ? processedValues[0] : processedValues
    } else {
        newValue = processItem(value)
    }

    return { char, value: newValue }
})

// 生成拆分结果
const chaiFen = Object.entries(buShouData)
    .map(([char, [bs, isStart]]) => {
        const bh = biHuaData[char]
        let res_bs = bs
        let strokes = isStart == 0 ? bh.slice(biHuaData[bs].length) : bh.slice(0, 4)

        if (ziGenData[char]) {
            res_bs = char
            strokes = bh[bh.length - 1]
        }

        if (bs === '匚') {
            strokes = bh.slice(1, -1)
        }

        if (bs === '囗') {
            strokes = bh.slice(2, -1)
        }

        if (char == '即' || char == '既' || char == '暨') {
            strokes = bh.slice(5)
        }

        if (char === '竹') {
            res_bs = ''
            strokes = bh[bh.length - 1]
        }

        if (strokes.length == 0) {
            strokes = bh
        }

        while (strokes.length < 4) {
            strokes += strokes.charAt(strokes.length - 1)
        }

        const dy = shengMu.find(item => item.char == char).value
        let result = null

        if (Array.isArray(dy)) {
            result = dy.map(item => ({
                char,
                dy: item,
                bs: res_bs,
                strokes: strokes.slice(0, 4)
            }))
        } else {
            result = {
                char,
                dy: dy,
                bs: res_bs,
                strokes: strokes.slice(0, 4)
            }
        }

        return result
    })
    .flat()

writeToFile(
    chaiFen,
    './output/output_chaifen_original.txt',
    item =>
        `${item.char}\t${item.dy} ${item.bs} ${item.strokes[0]} ${item.strokes[1]} ${item.strokes[2]} ${item.strokes[3]}`
)

const gbData = require('./info/guibing.json')

const guiBing = chaiFen.map(item => {
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

writeToFile(
    guiBing,
    './output/output_chaifen_guibing.txt',
    item =>
        `${item.char}\t${item.dy} ${item.bs} ${item.strokes[0]} ${item.strokes[1]} ${item.strokes[2]} ${item.strokes[3]}`
)
