const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')

let base = './meteorologi-klimatologi-geofisika/cuaca/'
if (!fs.existsSync(base)){
  fs.mkdirSync(base, { recursive: true })
}

; (async () => {
  let result = {}
  for (let i = 1; i < 13; i++) {
    let response = await fetch('https://www.bmkg.go.id/cuaca/prakiraan-cuaca-bandara.bmkg?s=' + i)
    let $ = cheerio.load(await response.text())
    let table = $('body > div.wrapper > div.container.content > div > div.col-md-8.margin-bottom-20 > div > table > tbody').html() || ''
    let tr = table.match(/<tr>/g) || []
    for (let j = 0; j < (tr.length || 150); j++) {
      let data = $('body > div.wrapper > div.container.content > div > div.col-md-8.margin-bottom-20 > div > table > tbody > tr').eq(j).find('td')
      if (!data.html) continue
      let bandara = $(data).eq(1).text().trim()
      let waktu = $(data).eq(2).text().trim()
      let arah_angin = $(data).eq(3).text().trim()
      let kecepatan = $(data).eq(4).text().trim() + ' km/jam'
      let jarak_pandang = $(data).eq(5).text().trim() + ' km'
      let cuaca = $(data).eq(6).text().trim()
      let probabilitas = $(data).eq(7).text().trim()
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
  if (result.length) await fs.writeFileSync(base + 'prakiraan_cuaca_bandara.json', JSON.stringify(result, null, 2))
})()

; (async () => {
  let response = await fetch('https://www.bmkg.go.id/cuaca/cuaca-aktual-bandara.bmkg')
  let $ = cheerio.load(await response.text())
  let result = []
  let table = $('body > div.wrapper > div.container.content > div > div.col-md-8.margin-bottom-20 > table > tbody').html() || ''
  let tr = table.match(/<tr>/g) || []
  for (let i = 0; i < (tr.length || 150); i++) {
    let data = $('body > div.wrapper > div.container.content > div > div.col-md-8.margin-bottom-20 > table > tbody > tr').eq(i).find('td')
    if (!data.html) continue
    let bandara = $(data).eq(1).find('a').text().trim()
    let waktu_pengamatan = $(data).eq(2).text().trim()
    let arah_angin = $(data).eq(3).text().trim()
    let kecepatan = $(data).eq(4).text().trim() + ' km/jam'
    let jarak_pandang = $(data).eq(5).text().trim() + ' km'
    let cuaca = $(data).eq(6).text().trim()
    let suhu = $(data).eq(7).text().trim() + ' °C'
    let titik_embun = $(data).eq(8).text().trim() + ' °C'
    let tekanan_udara = $(data).eq(9).text().trim() + ' hPa'
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
  if (result.length) await fs.writeFileSync(base + 'cuaca_aktual_bandara.json', JSON.stringify(result, null, 2))
})()

; (async () => {
  let response = await fetch('https://www.bmkg.go.id/cuaca/prakiraan-cuaca-indonesia.bmkg')
  let $$ = cheerio.load(await response.text())
  let table = $$('body > div.wrapper > div.container.content > div > div.col-md-8.margin-bottom-20 > div > div.row.list-cuaca-provinsi.md-margin-bottom-10').html() || ''
  let div = table.match(/<div ?class=\"col-sm-4 ?col-xs-6\">/g) || []
  let data = []
  for (let i = 0; i < (div.length || 50); i++) {
    let result = $$('body > div.wrapper > div.container.content > div > div.col-md-8.margin-bottom-20 > div > div.row.list-cuaca-provinsi.md-margin-bottom-10 > div').eq(i).find('a')
    data.push({
      provinsi: $$(result).text().trim(),
      url: ('https://www.bmkg.go.id/cuaca/prakiraan-cuaca-indonesia.bmkg' + $$(result).attr('href')).trim()
    })
  }
  for (let i = 0; i < data.length; i++) {
    let result = []
    let info = data[i]
    let provinsi = (info.provinsi).toLowerCase()
    let directory = base + 'provinsi/' + provinsi + '/'
    if (!fs.existsSync(directory)){
      console.error(directory)
      await fs.mkdirSync(directory, { recursive: true })
    }

    let respons = await fetch(info.url)
    if (!respons.ok) continue
    let $ = cheerio.load(await respons.text())
    let ress = $('#TabPaneCuaca1 > div > table > tbody').eq(0).html() || ''
    let trr = ress.match(/<tr>/g) || []
    for (let j = 0; j < (trr.length || 5); j++) {
      let dataa = $('#TabPaneCuaca1 > div > table > tbody').eq(0).find('tr').eq(j).find('td')
      if (!dataa.html()) continue
      let kota = $(dataa).eq(0).find('a').text().trim()
      let malam = $(dataa).eq(1).find('span').text().trim()
      let icon_malam = encodeURI($(dataa).eq(1).find('img').attr('src'))
      let dini_hari = $(dataa).eq(2).find('span').text().trim()
      let icon_dini_hari = encodeURI($(dataa).eq(2).find('img').attr('src'))
      let suhu = $(dataa).eq(3).text().trim() + ' °C'
      let kelembapan = $(dataa).eq(4).text().trim() + '%'
      result.push({
        kota,
        prakiraan_cuaca: {
          malam,
          icon_malam,
          dini_hari,
          icon_dini_hari,
        },
        suhu,
        kelembapan
      })
    }

    let table = $('#TabPaneCuaca1 > div > table > tbody').eq(1).html() || ''
    let tr = table.match(/<tr>/g) || []
    for (let j = 0; j < (tr.length || 100); j++) { 
      let dataa = $('#TabPaneCuaca1 > div.table-responsive > table > tbody').eq(1).find('tr').eq(j).find('td')
      if (!dataa.html()) continue
      let kota = $(dataa).eq(0).find('a').text().trim()
      let malam = $(dataa).eq(1).find('span').text().trim()
      let icon_malam = encodeURI($(dataa).eq(1).find('img').attr('src'))
      let dini_hari = $(dataa).eq(2).find('span').text().trim()
      let icon_dini_hari = encodeURI($(dataa).eq(2).find('img').attr('src'))
      let suhu = $(dataa).eq(3).text().trim() + ' °C'
      let kelembapan = $(dataa).eq(4).text().trim() + '%'
      result.push({
        kota,
        prakiraan_cuaca: {
          malam,
          icon_malam,
          dini_hari,
          icon_dini_hari,
        },
        suhu,
        kelembapan
      })
    }
    if (result.length) await fs.writeFileSync(directory + 'prakiraan_cuaca.json', JSON.stringify(result, null, 2))
  }
})
