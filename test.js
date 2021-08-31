const fs = require('fs')
const path = require('path')
const assert = require('assert')
const { spawn } = require('child_process')

async function check() {
  let base = path.join(__dirname, './')
  let dir = await readdir(base)
  let files = []
  let dirnames = dir.filter(gx).map(v => base + v)
  while (dirnames.length !== 0) {
    if (await isDirectory(dirnames[0])) {
      let path = await readdir(dirnames[0])
      path.filter(gx).map(file => dirnames.push(dirnames[0] + '/' + file))
    } else if (yes(dirnames[0])) {
      files.push(dirnames[0])
    }
    dirnames.shift()
  }

  for (let file of files) {
    if (file === require.resolve(__filename)) continue
    const error = (e) => assert.ok(e.length < 1, file + '\n\n' + e.toString())
    console.error('Checking', file)
    if (file.endsWith('.json')) try { parse(file) } catch(e) { return error(e) }
    else if (file.endsWith('.js')) try { node(file) } catch(e) { return error(e) }
    assert.ok(file)
    console.log('Done checking', file)
  }
}

async function readdir(path) {
  return await fs.readdirSync(path)
}

async function isDirectory(path) {
  return await fs.statSync(path).isDirectory()
}

function parse(path) {
  try {
    return JSON.parse(fs.readFileSync(path))
  } catch (err) {
    throw err.toString()
  }
}

function node(file) {
  return spawn(process.argv0, ['-c', file])
    .on('close', () => {
        return true
    })
    .stderr.on('data', (err) => {
    throw err.toString()
  })
}

function gx(file) {
  return (!file.endsWith('node_modules') && !file.startsWith('.')) || false
}

function yes(file) {
  return (file.endsWith('.json') || file.endsWith('.js')) || false
}

check()
