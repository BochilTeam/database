const fs = require('fs')
const path = require('path')
const assert = require('assert')

async function check() {
    let base = path.join(__dirname, './')
    let dir = readdir(base)
    dir.map(v => base + v)
    let files = []
    let dirnames = dir
    while (dirnames.length !== 0) {
        if (isDirectory(dirnames[0]) && filter(dirnames[0])) {
            let path = readdir(dirnames[0])
            path.filter(filter).map(file => dirnames.push(dirnames[0] + '/' + file))
        } else if (dirnames[0].endsWith('.json')) {
            files.push(dirnames[0])
        }
        dirnames.shift()
    }

    for (let file of files) {
        console.error('Checking', file)
        try {
            parse(file)
            assert.ok(file)
            console.log('Done checking', file)
        } catch (e) {
            assert.ok(e, file + '\n\n' + e)
            if (e) process.exit(1)
        }
    }
    // console.log(process.argv0)
}

function readdir(path) {
    return fs.readdirSync(path)
}

function isDirectory(path) {
    return fs.statSync(path).isDirectory()
}

function parse(path) {
    return JSON.parse(fs.readFileSync(path))
}

function filter(fileName) {
    return !fileName.startsWith('node_modules') && !fileName.startsWith('.')
}

check()
