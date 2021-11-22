let path = require('path')
let fs = require('fs')
const assert = require('assert')
const { spawn } = require('child_process')

  ; (function () {
    let base = path.join(__dirname, './')
    let dir = fs.readdirSync(base)
    for (let file of dir.filter(v => v.endsWith('.js') && v !== path.basename(__filename))) {
      console.error('Run', file)
      spawn(process.argv0, [path.join(__dirname, './' + file)])
        .on('close', () => {
          assert.ok(file)
          console.log('Done run', file)
        })
        .stderr.on('data', chunk => (assert.ok(chunk.length < 1, file + '\n\n' + chunk), process.exit(1)))
    }
  })()