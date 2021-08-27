const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')

let base = './covid19/'
if (!fs.existsSync(base)) {
  fs.mkdirSync(base, { recursive: true })
}

; (async () => {
  let result = []
  let results = []
  for (let z = 0; z < 10; z++) {
    result = []
    results = []
    let response = await fetch('https://covid19.go.id/')
    let $ = cheerio.load(await response.text())

    let negara_terpapar = $('#case > div > div > div > div > div:nth-child(1) > div:nth-child(3) > strong').text().trim()
    let terkonfirmasi = $('#case > div > div > div > div > div:nth-child(1) > div:nth-child(4) > strong').text().trim()
    let meninggal = $('#case > div > div > div > div > div:nth-child(1) > div:nth-child(5) > strong').text().trim()
    if (!negara_terpapar || !terkonfirmasi || !meninggal) continue
    results = {
      negara_terpapar,
      terkonfirmasi,
      meninggal
    }

    let positif = $('#case > div > div > div > div > div:nth-child(2) > div:nth-child(3) > strong').text().trim()
    let sembuh = $('#case > div > div > div > div > div:nth-child(2) > div:nth-child(4) > strong').text().trim()
    let gmeninggal = $('#case > div > div > div > div > div:nth-child(2) > div:nth-child(5) > strong').text().trim()
    if (!positif || !sembuh || !gmeninggal) continue
    result = {
      positif,
      sembuh,
      meninggal: gmeninggal
    }
    if (Object.keys(result).length && Object.keys(results).length) break
  }
  
  if (Object.keys(result).length) await fs.writeFileSync(base + 'indonesia.json', JSON.stringify(result, null, 2))
  if (Object.keys(results).length) await fs.writeFileSync(base + 'global.json', JSON.stringify(results, null, 2))
})()
