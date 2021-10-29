const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')

let base = './meteorologi-klimatologi-geofisika/gempa/'
if (!fs.existsSync(base)) {
  fs.mkdirSync(base, { recursive: true })
}

; (async () => {
  let result = []
  for (let z = 0; z < 10; z++) {
    result = []
    let response = await fetch('https://www.bmkg.go.id/gempabumi/gempabumi-terkini.bmkg')
    let $ = cheerio.load(await response.text())
    let table = $('body > div.wrapper > div.container.content > div > div.col-md-8 > div > div > table > tbody').html() || ''
    let tr = table.match(/<tr>/g) || []
    for (let i = 0; i < (tr.length || 50); i++) {
      let data = $('body > div.wrapper > div.container.content > div > div.col-md-8 > div > div > table > tbody > tr').eq(i).find('td')
      if (!($(data).html())) continue
      let waktu = $(data).eq(1).text().trim()
      let lintang = $(data).eq(2).text().trim()
      let bujur = $(data).eq(3).text().trim()
      let magnitudo = $(data).eq(4).text().trim()
      let kedalaman = $(data).eq(5).text().trim()
      let wilayah = $(data).eq(6).text().trim()
      if (!waktu || !lintang || !bujur || !magnitudo || !kedalaman || !wilayah) continue
      result.push({
        waktu,
        lintang,
        bujur,
        magnitudo,
        kedalaman,
        wilayah
      })
    }
    if (result.length) break
  }
  if (result.length) fs.writeFileSync(base + 'gempa_terkini.json', JSON.stringify(result, null, 2))
})()

  ; (async () => {
    let result = []
    for (let z = 0; z < 10; z++) {
      result = []
      let response = await fetch('https://www.bmkg.go.id/gempabumi/gempabumi-dirasakan.bmkg')
      let $ = cheerio.load(await response.text())
      let table = $('body > div.wrapper > div.container.content > div > div.col-md-8 > div > div > table > tbody').html() || ''
      let tr = table.match(/<tr>/g) || []
      for (let i = 0; i < (tr.length || 50); i++) {
        let data = $('body > div.wrapper > div.container.content > div > div.col-md-8 > div > div > table > tbody > tr').eq(i).find('td')
        if (!($(data).html())) continue
        let waktu = $(data).eq(1).html().replace(/<br>/g, ' ').trim()
        let lintang = $(data).eq(2).text().split(' ').slice(0, 2).map(v => v.trim()).join(' ')
        let bujur = $(data).eq(2).text().split(' ').slice(2, 4).map(v => v.trim()).join(' ')
        let magnitudo = $(data).eq(3).text().trim()
        let kedalaman = $(data).eq(4).text().trim()
        let wilayah = $(data).eq(5).find('a').text().trim()
        let warning = []
        let warning_jumlah = $(data).eq(5).html().match(/<span ?class=\"label label-warning\">/g)
        for (let j = 0; j < warning_jumlah.length; j++) warning.push($(data).eq(5).find('span').eq(j).text().replace('\t', ' ').trim())
        warning = warning.slice(0, warning.indexOf(''))
        if (!waktu || !lintang || !bujur || !magnitudo || !kedalaman || !wilayah || !warning) continue
        result.push({
          waktu,
          lintang,
          bujur,
          magnitudo,
          kedalaman,
          wilayah,
          warning,
        })
      }
      if (result.length) break
    }
    if (result.length) fs.writeFileSync(base + 'gempa_dirasakan.json', JSON.stringify(result, null, 2))
  })()

  ; (async () => {
    let result = []
    for (let z = 0; z < 10; z++) {
      result = []
      let response = await fetch('https://www.bmkg.go.id/tsunami/')
      let $ = cheerio.load(await response.text())
      let table = $('body > div.wrapper > div.container.content > div > div.col-md-8 > table > tbody').html() || ''
      let tr = table.match(/<tr/g) || []
      for (let i = 0; i < (tr.length || 50); i++) {
        let data = $('body > div.wrapper > div.container.content > div > div.col-md-8 > table > tbody > tr').eq(i).find('td')
        if (!($(data).html())) continue
        let waktu = ($(data).eq(0).html() || '').replace(/<br>/g, ' ').trim()
        let lokasi = $(data).eq(1).text().trim()
        let magnitude = $(data).eq(2).text().trim()
        let kedalaman = $(data).eq(3).text().trim()
        let wilayah = $(data).eq(4).text().trim()
        if (!waktu || !lokasi || !magnitude || !kedalaman || !wilayah) continue
        result.push({
          waktu,
          lokasi,
          magnitude,
          kedalaman,
          wilayah
        })
      }
      if (result.length) break
    }
    if (result.length) fs.writeFileSync(base + 'tsunami.json', JSON.stringify(result, null, 2))
  })()