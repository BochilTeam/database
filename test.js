const fs = require('fs')
const path = require('path')
const assert = require('assert')
const { spawn } = require('child_process')

function getFile() {
  let base = path.join(__dirname, './')
  let dir = readdir(base)
  let files = []
  let dirnames = dir.filter(gx).map(v => base + v)
  while (dirnames.length !== 0) {
    if (isDirectory(dirnames[0])) {
      let path = readdir(dirnames[0])
      path.filter(gx).map(file => dirnames.push(dirnames[0] + '/' + file))
    } else if (yes(dirnames[0])) {
      files.push(dirnames[0])
    }
    dirnames.shift()
  }
  return files
}

function check() {
  let files = getFile()
  for (let file of files) {
    if (file === require.resolve(__filename)) continue
    const error = (e) => assert.ok(e.length < 1, file + '\n\n' + e.toString())
    const check = (fn) => (new Promise(async (resolve, reject) => { try { resolve(await fn(file)) } catch (e) { reject(e) }}))
    console.error('Checking', file)
    check(file.endsWith('.json') ? parse : file.endsWith('.js') ? node : () => (undefined)).then(() => (assert.ok(file), console.log('Done checking', file))).catch(error)
  }
}

/**
 * read directory
 * @param {String} path 
 * @returns string[]
 */
function readdir(path) {
  return fs.readdirSync(path)
}

/**
 * path is a directory?
 * @param {String} path 
 * @returns boolean
 */
function isDirectory(path) {
  return (fs.statSync(path)).isDirectory()
}

/**
 * parse/check .json file
 * @param {String} path 
 * @returns any
 */
function parse(path) {
  try {
    return JSON.parse(fs.readFileSync(path))
  } catch (err) {
    throw err.toString()
  }
}

/**
 * Check .js file
 * @param {String} file 
 * @returns internal.Readable
 */
function node(file) {
  return spawn(process.argv0, ['-c', file])
    .on('close', () => {
      return true
    })
    .stderr.on('data', (err) => {
      throw err.toString()
    })
}

/**
 * not?
 * @param {String} file 
 * @returns boolean
 */
function gx(file) {
  return (!file.endsWith('node_modules') && !file.startsWith('.')) || false
}

/**
 * yes?
 * @param {String} file 
 * @returns boolean
 */
function yes(file) {
  return (file.endsWith('.json') || file.endsWith('.js')) || false
}

check()
