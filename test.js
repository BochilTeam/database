const fs = require('fs')
const path = require('path')
const assert = require('assert')

async function check() {
    let base = path.join(__dirname, './')
    let dir = await readdir(base)
    dir.map(v => base + v)
    let files = []
    let dirnames = dir
    while (dirnames.length !== 0) {
        if (await isDirectory(dirnames[0])) {
            let path = await readdir(dirnames[0])
            path.filter(v => !v.endsWith('node_modules') && !v.startsWith('.')).map(file => dirnames.push(dirnames[0] + '/' + file))
        } else if (dirnames[0].endsWith('.json')) {
            files.push(dirnames[0])
        }
        dirnames.shift()
    }
    
    for (let file of files) {
        console.error('Checking', file)
        try {
            await parse(file)
            assert.ok(file)
            console.log('Done checking', file)
        }  catch (e) {
            assert.ok(e.length < 1, file + '\n\n' + e)
        }
    }
    // console.log(process.argv0)
}

async function readdir(path) {
    return await fs.readdirSync(path)
}

async function isDirectory(path) {
    return await fs.statSync(path).isDirectory()
}

async function parse(path) {
    return JSON.parse(await fs.readFileSync(path))
}

check()
