const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')

let base = './meteorologi-klimatologi-geofisika/tanda_waktu/'
if (!fs.existsSync(base)) {
  fs.mkdirSync(base, { recursive: true })
}

; (async () => {
  let result = []
  for (let z = 0; z < 10; z++) {
    result = []
    let response = await fetch('https://www.bmkg.go.id/tanda-waktu/terbit-terbenam-matahari.bmkg')
    let $ = cheerio.load(await response.text())
    let table = $('body > div.wrapper > div.container.content > div > div.col-md-8 > table > tbody').html() || ''
    let tr = table.match(/<tr>/g) || []
    for (let i = 0; i < (tr.length || 50); i++) {
      let data = $('body > div.wrapper > div.container.content > div > div.col-md-8 > table > tbody > tr').eq(i).find('td')
      if (!($(data).html())) continue
      let kota = $(data).eq(0).text().trim()
      let waktu_fajar = $(data).eq(1).text().trim()
      let waktu_terbit = $(data).eq(2).text().trim()
      let azimuth_saat_terbit = $(data).eq(3).text().trim() + '°'
      let waktu_transit = $(data).eq(4).text().trim()
      let tinggi_saat_transit = $(data).eq(5).text().trim() + '°'
      let waktu_terbenam = $(data).eq(6).text().trim()
      let azimuth_saat_terbenam = $(data).eq(7).text().trim() + '°'
      let waktu_senja = $(data).eq(8).text().trim()
      if (!kota || !waktu_fajar || !waktu_terbit || !azimuth_saat_terbit || !waktu_transit || !tinggi_saat_transit || !waktu_terbenam || !azimuth_saat_terbenam || !waktu_senja) continue
      result.push({
        kota,
        waktu_fajar,
        waktu_terbit,
        azimuth_saat_terbit,
        waktu_transit,
        tinggi_saat_transit,
        waktu_terbenam,
        azimuth_saat_terbenam,
        waktu_senja
      })
    }
    if (result.length) break
  }
  if (result.length) fs.writeFileSync(base + 'terbit_terbenam_matahari.json', JSON.stringify(result, null, 2))
})()