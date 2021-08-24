let path = require('path')
let fs = require('fs')

; (async () => { 
  let base = path.join(__dirname, './')
  let dir = await fs.readdirSync(base)
  for (let file of dir.filter(v => v.endsWith('.js'))) {
    require('./' + file)
  }
})()
