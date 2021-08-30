let path = require('path')
let fs = require('fs')
const assert = require('assert')
const { spawn } = require('child_process')

; (async () => { 
  let base = path.join(__dirname, './')
  let dir = await fs.readdirSync(base)
  for (let file of dir.filter(v => v.endsWith('.js') && v !== path.basename(__filename)).map(v => base + v)) {
    console.error('Run', file)
    try {
      node(file)
      assert.ok(file)
      console.log('Done run', file)
    } catch (e) {
      assert.ok(e.length < 1, file + '\n\n' + e)
      process.exit(1)
    }
  }
})()

function node(file) {
  return new Promise((resolve, reject) => {
    spawn(process.argv0, ['-c', file])
      .on('close', resolve)
      .stderr.on('data', reject)
  })
}