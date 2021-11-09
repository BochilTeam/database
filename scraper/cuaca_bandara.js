const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')

let base = './meteorologi-klimatologi-geofisika/cuaca/'
if (!fs.existsSync(base)) {
  fs.mkdirSync(base, { recursive: true })
}

let dir_bandara = base + 'bandara/'
if (!fs.existsSync(dir_bandara)) {
  fs.mkdirSync(dir_bandara, { recursive: true })
}

; (async () => {
  if (process.env.CUACA_AKTUAL) return
  let result = {}
  for (let z = 0; z < 10; z++) {
    result = {}
    for (let i = 1; i < 13; i++) {
      let response = await fetch('https://www.bmkg.go.id/cuaca/prakiraan-cuaca-bandara.bmkg?s=' + i)
      let $ = cheerio.load(await response.text())
      let table = $('body > div.wrapper > div.container.content > div > div.col-md-8.margin-bottom-20 > div > table > tbody').html() || ''
      let tr = table.match(/<tr>/g) || []
      for (let j = 0; j < (tr.length || 150); j++) {
        let data = $('body > div.wrapper > div.container.content > div > div.col-md-8.margin-bottom-20 > div > table > tbody > tr').eq(j).find('td')
        if (!($(data).html())) continue
        let bandara = $(data).eq(1).text().trim()
        let waktu = $(data).eq(2).text().trim()
        let arah_angin = $(data).eq(3).text().trim()
        let kecepatan = $(data).eq(4).text().trim() + ' km/jam'
        let jarak_pandang = $(data).eq(5).text().trim() + ' km'
        let cuaca = $(data).eq(6).text().trim()
        let probabilitas = $(data).eq(7).text().trim()
        if (!bandara || !waktu || !arah_angin || !kecepatan || !jarak_pandang || !cuaca) continue
        let inf = `${i}_jam_akan_datang`
        if (!result[inf]) result[inf] = []
        result[inf].push({
          bandara,
          waktu,
          arah_angin,
          kecepatan,
          jarak_pandang,
          cuaca,
          probabilitas
        })
      }
    }
    if (Object.keys(result).length) break
  }
  if (Object.keys(result).length) fs.writeFileSync(dir_bandara + 'prakiraan_cuaca_bandara.json', JSON.stringify(result, null, 2))
})()

  ; (async () => {
    let result = []
    for (let z = 0; z < 10; z++) {
      result = []
      let response = await fetch('https://www.bmkg.go.id/cuaca/cuaca-aktual-bandara.bmkg')
      let $ = cheerio.load(await response.text())
      let table = $('body > div.wrapper > div.container.content > div > div.col-md-8.margin-bottom-20 > table > tbody').html() || ''
      let tr = table.match(/<tr>/g) || []
      for (let i = 0; i < (tr.length || 150); i++) {
        let data = $('body > div.wrapper > div.container.content > div > div.col-md-8.margin-bottom-20 > table > tbody > tr').eq(i).find('td')
        if (!($(data).html())) continue
        let bandara = $(data).eq(1).find('a').text().trim()
        let waktu_pengamatan = $(data).eq(2).text().trim()
        let arah_angin = $(data).eq(3).text().trim()
        let kecepatan = $(data).eq(4).text().trim() + ' km/jam'
        let jarak_pandang = $(data).eq(5).text().trim() + ' km'
        let cuaca = $(data).eq(6).text().trim()
        let suhu = $(data).eq(7).text().trim() + ' °C'
        let titik_embun = $(data).eq(8).text().trim() + ' °C'
        let tekanan_udara = $(data).eq(9).text().trim() + ' hPa'
        if (!bandara || !waktu_pengamatan || !arah_angin || !kecepatan || !jarak_pandang || !cuaca || !suhu || !titik_embun || !tekanan_udara) continue
        result.push({
          bandara,
          waktu_pengamatan,
          arah_angin,
          kecepatan,
          jarak_pandang,
          cuaca,
          suhu,
          titik_embun,
          tekanan_udara
        })
      }
      if (result.length) break
    }
    if (result.length) fs.writeFileSync(dir_bandara + 'cuaca_aktual_bandara.json', JSON.stringify(result, null, 2))
  })()