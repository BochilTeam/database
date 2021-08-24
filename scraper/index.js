let path = require('path')
let fs = require('fs')
const assert = require('assert')

; (async () => { 
  let base = path.join(__dirname, './')
  let dir = await fs.readdirSync(base)
  for (let file of dir.filter(v => v.endsWith('.js') && v !== path.basename(__filename))) {
    console.error('Run', file)
    try {
      require('./' + file)
      assert.ok(file)
      console.log('Done run', file)
    } catch (e) {
      assert.ok(e.length < 1, file + '\n\n' + e)
    }
  }
})()