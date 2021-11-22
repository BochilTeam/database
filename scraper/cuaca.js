const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')

let base = './meteorologi-klimatologi-geofisika/cuaca/'
if (!fs.existsSync(base)) {
  fs.mkdirSync(base, { recursive: true })
}

if (!fs.existsSync(base + 'provinsi/')) {
  fs.mkdirSync(base + 'provinsi/', { recursive: true })
}

; (async () => {
  let results = []
  let data = []
  for (let z = 0; z < 10; z++) {
    results = []
    data = []
    let response = await fetch('https://www.bmkg.go.id/cuaca/prakiraan-cuaca-indonesia.bmkg')
    let $$ = cheerio.load(await response.text())

    let tablee = $$('#TabPaneCuaca1 > div > table > tbody') // #TabPaneCuaca1 > div > table > tbody
    let data1 = async () => {
      let data = $$(tablee).eq(0).find('tr') //#TabPaneCuaca1 > div > table > tbody:nth-child(1) > tr
      //if (!($$(data).html())) continue
      let hmm = (($$(data).html() || '').match(/<td>/g) || []).length
      //if (!hmm) continue
      data = $$('#TabPaneCuaca2 > div > table > tbody').eq(0).find('tr > td')
      let kota = $$(data).eq(0).find('a').text().trim()
      let siang, icon_siang
      let malam, icon_malam
      let dini_hari, icon_dini_hari
      let suhu, kelembapan
      if (hmm == 6) {
        siang = $$(data).eq(1).find('span').text().trim()
        icon_siang = $$(data).eq(1).find('img').attr('src')
        malam = $$(data).eq(2).find('span').text().trim()
        icon_malam = $$(data).eq(2).find('img').attr('src')
        dini_hari = $$(data).eq(3).find('span').text().trim()
        icon_dini_hari = $$(data).eq(3).find('img').attr('src')
        suhu = $$(data).eq(4).text().trim()
        kelembapan = $$(data).eq(5).text().trim()
      } else if (hmm == 5) {
        malam = $$(data).eq(1).find('span').text().trim()
        icon_malam = $$(data).eq(1).find('img').attr('src')
        dini_hari = $$(data).eq(2).find('span').text().trim()
        icon_dini_hari = $$(data).eq(2).find('img').attr('src')
        suhu = $$(data).eq(3).text().trim()
        kelembapan = $$(data).eq(4).text().trim()
      } else if (hmm == 4) {
        dini_hari = $$(data).eq(1).find('span').text().trim()
        icon_dini_hari = $$(data).eq(1).find('img').attr('src')
        suhu = $$(data).eq(2).text().trim()
        kelembapan = $$(data).eq(3).text().trim()
      }

      // encodeURI url
      if (icon_siang) icon_siang = encodeURI(icon_siang)
      if (icon_malam) icon_malam = encodeURI(icon_malam)
      if (icon_dini_hari) icon_dini_hari = encodeURI(icon_dini_hari)
      // icon?
      if (suhu) suhu += ' °C'
      if (kelembapan) kelembapan += '%'

      results.push({
        kota,
        prakiraan_cuaca: {
          siang,
          icon_siang,
          malam,
          icon_malam,
          dini_hari,
          icon_dini_hari,
        },
        suhu,
        kelembapan
      })
    }
    await data1()

    let tr = ($$(tablee).eq(1).html() || '').match(/<tr>/g) || []
    for (let i = 0; i < (tr.length || 50); i++) {
      let data = $$(tablee).eq(1).find('tr').eq(i)
      if (!($$(data).html())) continue
      let hmm = (($$(data).html() || '').match(/<td>/g) || []).length
      if (!hmm) continue
      data = $$(tablee).eq(1).find('tr').eq(i).find('td')
      let kota = $$(data).eq(0).find('a').text().trim()
      let siang, icon_siang
      let malam, icon_malam
      let dini_hari, icon_dini_hari
      let suhu, kelembapan
      if (hmm == 6) {
        siang = $$(data).eq(1).find('span').text().trim()
        icon_siang = $$(data).eq(1).find('img').attr('src').trim()
        malam = $$(data).eq(2).find('span').text().trim()
        icon_malam = $$(data).eq(2).find('img').attr('src').trim()
        dini_hari = $$(data).eq(3).find('span').text().trim()
        icon_dini_hari = $$(data).eq(3).find('img').attr('src')
        suhu = $$(data).eq(4).text().trim()
        kelembapan = $$(data).eq(5).text().trim()
      } else if (hmm == 5) {
        malam = $$(data).eq(1).find('span').text().trim()
        icon_malam = $$(data).eq(1).find('img').attr('src')
        dini_hari = $$(data).eq(2).find('span').text().trim()
        icon_dini_hari = $$(data).eq(2).find('img').attr('src')
        suhu = $$(data).eq(3).text().trim()
        kelembapan = $$(data).eq(4).text().trim()
      } else if (hmm == 4) {
        dini_hari = $$(data).eq(1).find('span').text().trim()
        icon_dini_hari = $$(data).eq(1).find('img').attr('src')
        suhu = $$(data).eq(2).text().trim()
        kelembapan = $$(data).eq(3).text().trim()
      }

      // encodeURI url
      if (icon_siang) icon_siang = encodeURI(icon_siang)
      if (icon_malam) icon_malam = encodeURI(icon_malam)
      if (icon_dini_hari) icon_dini_hari = encodeURI(icon_dini_hari)
      // icon?
      if (suhu) suhu += ' °C'
      if (kelembapan) kelembapan += '%'

      results.push({
        kota,
        prakiraan_cuaca: {
          siang,
          icon_siang,
          malam,
          icon_malam,
          dini_hari,
          icon_dini_hari,
        },
        suhu,
        kelembapan
      })
    }
    let table = $$('body > div.wrapper > div.container.content > div > div.col-md-8.margin-bottom-20 > div > div.row.list-cuaca-provinsi.md-margin-bottom-10').html() || ''
    let div = table.match(/<div ?class=\"col-sm-4 ?col-xs-6\">/g) || []
    for (let i = 0; i < (div.length || 50); i++) {
      let result = $$('body > div.wrapper > div.container.content > div > div.col-md-8.margin-bottom-20 > div > div.row.list-cuaca-provinsi.md-margin-bottom-10 > div').eq(i).find('a')
      let provinsi = $$(result).text().trim()
      let url = $$(result).attr('href')
      if (!provinsi || !url) continue
      data.push({
        provinsi,
        url: encodeURI(('https://www.bmkg.go.id/cuaca/prakiraan-cuaca-indonesia.bmkg' + url).trim())
      })
    }

    if (results.length && data.length) break
  }
  if (results.length) fs.writeFileSync(base + 'cuaca.json', JSON.stringify(results, null, 2))
  if (data.length)  fs.writeFileSync(base + 'provinsi/info.json', JSON.stringify(data, null, 2))

  let result = []
  let directory
  for (let i = 0; i < data.length; i++) {
    for (let z = 0; z < 10; z++) {
      result = []
      directory = ''
      let info = data[i]
      let provinsi = (info.provinsi).toLowerCase()
      directory = base + 'provinsi/' + provinsi + '/'
      if (!fs.existsSync(directory)) {
         fs.mkdirSync(directory, { recursive: true })
      }

      let respons = await fetch(info.url)
      if (!respons.ok) continue
      let $ = cheerio.load(await respons.text())
      let ress = $('#TabPaneCuaca1 > div > table > tbody').eq(0).html() || ''
      let trr = ress.match(/<tr>/g) || []
      for (let j = 0; j < (trr.length || 5); j++) {
        let dataa = $('#TabPaneCuaca1 > div > table > tbody').eq(0).find('tr').eq(j)
        if (!($(dataa).html())) continue
        let hmm = (($(dataa).html() || '').match(/<td>/g) || []).length
        if (!hmm) continue
        dataa = $('#TabPaneCuaca1 > div > table > tbody').eq(0).find('tr').eq(j).find('td')
        let kota = $(dataa).eq(0).find('a').text().trim()
        let siang, icon_siang
        let malam, icon_malam
        let dini_hari, icon_dini_hari
        let suhu, kelembapan
        if (hmm == 6) {
          siang = $(dataa).eq(1).find('span').text().trim()
          icon_siang = $(dataa).eq(1).find('img').attr('src')
          malam = $(dataa).eq(2).find('span').text().trim()
          icon_malam = $(dataa).eq(2).find('img').attr('src')
          dini_hari = $(dataa).eq(3).find('span').text().trim()
          icon_dini_hari = $(dataa).eq(3).find('img').attr('src')
          suhu = $(dataa).eq(4).text().trim()
          kelembapan = $(dataa).eq(5).text().trim()
        } else if (hmm == 5) {
          malam = $(dataa).eq(1).find('span').text().trim()
          icon_malam = $(dataa).eq(1).find('img').attr('src')
          dini_hari = $(dataa).eq(2).find('span').text().trim()
          icon_dini_hari = $(dataa).eq(2).find('img').attr('src')
          suhu = $(dataa).eq(3).text().trim()
          kelembapan = $(dataa).eq(4).text().trim()
        } else if (hmm == 4) {
          dini_hari = $(dataa).eq(1).find('span').text().trim()
          icon_dini_hari = $(dataa).eq(1).find('img').attr('src')
          suhu = $(dataa).eq(2).text().trim()
          kelembapan = $(dataa).eq(3).text().trim()
        }
        if (!kota || !(siang || icon_siang || malam || icon_malam || dini_hari || icon_dini_hari) || !suhu || !kelembapan) continue

        // encodeURI url
        if (icon_siang) icon_siang = encodeURI(icon_siang.trim())
        if (icon_malam) icon_malam = encodeURI(icon_malam.trim())
        if (icon_dini_hari) icon_dini_hari = encodeURI(icon_dini_hari.trim())
        // icon?
        if (suhu) suhu += ' °C'
        if (kelembapan) kelembapan += '%'

        result.push({
          kota,
          prakiraan_cuaca: {
            siang,
            icon_siang,
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
        let dataa = $('#TabPaneCuaca1 > div > table > tbody').eq(1).find('tr').eq(j)
        if (!($(dataa).html())) continue
        let hmm = (($(dataa).html() || '').match(/<td>/g) || []).length
        if (!hmm) continue
        dataa = $('#TabPaneCuaca1 > div > table > tbody').eq(1).find('tr').eq(j).find('td')
        let kota = $(dataa).eq(0).find('a').text().trim()
        let siang, icon_siang
        let malam, icon_malam
        let dini_hari, icon_dini_hari
        let suhu, kelembapan
        if (hmm == 6) {
          siang = $(dataa).eq(1).find('span').text().trim()
          icon_siang = $(dataa).eq(1).find('img').attr('src')
          malam = $(dataa).eq(2).find('span').text().trim()
          icon_malam = $(dataa).eq(2).find('img').attr('src')
          dini_hari = $(dataa).eq(3).find('span').text().trim()
          icon_dini_hari = $(dataa).eq(3).find('img').attr('src')
          suhu = $(dataa).eq(4).text().trim()
          kelembapan = $(dataa).eq(5).text().trim()
        } else if (hmm == 5) {
          malam = $(dataa).eq(1).find('span').text().trim()
          icon_malam = $(dataa).eq(1).find('img').attr('src')
          dini_hari = $(dataa).eq(2).find('span').text().trim()
          icon_dini_hari = $(dataa).eq(2).find('img').attr('src')
          suhu = $(dataa).eq(3).text().trim()
          kelembapan = $(dataa).eq(4).text().trim()
        } else if (hmm == 4) {
          dini_hari = $(dataa).eq(1).find('span').text().trim()
          icon_dini_hari = $(dataa).eq(1).find('img').attr('src')
          suhu = $(dataa).eq(2).text().trim()
          kelembapan = $(dataa).eq(3).text().trim()
        }
        if (!kota || !(siang || icon_siang || malam || icon_malam || dini_hari || icon_dini_hari) || !suhu || !kelembapan) continue

        // encodeURI url
        if (icon_siang) icon_siang = encodeURI(icon_siang.trim())
        if (icon_malam) icon_malam = encodeURI(icon_malam.trim())
        if (icon_dini_hari) icon_dini_hari = encodeURI(icon_dini_hari.trim())
        // icon?
        if (suhu) suhu += ' °C'
        if (kelembapan) kelembapan += '%'

        result.push({
          kota,
          prakiraan_cuaca: {
            siang,
            icon_siang,
            malam,
            icon_malam,
            dini_hari,
            icon_dini_hari,
          },
          suhu,
          kelembapan
        })
      }
      if (result.length) {
        fs.writeFileSync(directory + 'prakiraan_cuaca.json', JSON.stringify(result, null, 2))
        break
      }
    }
  }
})()