const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')

; (async () => {
  let response = await fetch('https://www.bmkg.go.id/gempabumi/gempabumi-terkini.bmkg')
  let $ = cheerio.load(await response.text())
  let result = []
  for (let i = 0; i < 30; i++) {
    let data = $('body > div.wrapper > div.container.content > div > div.col-md-8 > div > div > table > tbody > tr').eq(i).find('td')
    let waktu = $(data).eq(1).text().trim()
    let lintang = $(data).eq(2).text().trim()
    let bujur = $(data).eq(3).text().trim()
    let magnitudo = $(data).eq(4).text().trim()
    let kedalaman = $(data).eq(5).text().trim()
    let wilayah = $(data).eq(6).text().trim()
    result.push({
      waktu,
      lintang,
      bujur,
      magnitudo,
      kedalaman,
      wilayah
    })
  }
  await fs.writeFileSync('./meteorologi-klimatologi-geofisika/gempa/gempa_terkini.json', JSON.stringify(result, null, 2))
})()

; (async () => {
  let response = await fetch('https://www.bmkg.go.id/gempabumi/gempabumi-dirasakan.bmkg')
  let $ = cheerio.load(await response.text())
  let result = []
  for (let i = 0; i < 20; i++) {
    let data = $('body > div.wrapper > div.container.content > div > div.col-md-8 > div > div > table > tbody > tr').eq(i).find('td')
    let waktu = $(data).eq(1).html().replace(/<br>/g, ' ').trim()
    let lintang = $(data).eq(2).text().split(' ').slice(0, 2).map(v => v.trim()).join(' ')
    let bujur = $(data).eq(2).text().split(' ').slice(2, 4).map(v => v.trim()).join(' ')
    let magnitudo = $(data).eq(3).text().trim()
    let kedalaman = $(data).eq(4).text().trim()
    let wilayah = $(data).eq(5).find('a').text().trim()
    let warning = []
    let warning_jumlah = $(data).eq(5).html().match(/<span ?class=\"label label-warning\">/g)
    for (let j = 0; j < warning_jumlah.length; j++) warning.push($(data).eq(5).find('span').eq(j).text().replace('\t', ' ').trim())
    result.push({
      waktu, 
      lintang, 
      bujur,
      magnitudo,
      kedalaman,
      wilayah,
      warning: warning.slice(0, warning.indexOf(''))
    })
  }
  await fs.writeFileSync('./meteorologi-klimatologi-geofisika/gempa/gempa_dirasakan.json', JSON.stringify(result, null, 2))
})()