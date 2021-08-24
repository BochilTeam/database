let path = require('path')
let fs = require('fs')

; (async () => { 
  let base = path.join(__dirname, './')
  let dir = await fs.readdirSync(base)
  dir.map(v => base + v)
  for (let file of dir.filter(v => v.endsWith('.js'))) {
    await (await require(file))
  }
})()