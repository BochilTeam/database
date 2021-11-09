const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')

let base = './jadwaltv/'
if (!fs.existsSync(base)) {
  fs.mkdirSync(base, { recursive: true })
}
let resultss = {}
  ; (async () => {
    let jadwal = []
    for (let z = 0; z < 10; z++) {
      jadwal = []
      resultss = {}
      let response = await fetch('https://www.jadwaltv.net/')
      let $ = cheerio.load(await response.text())
      let jadwaltv = $('#menu-jadwaltv')
      let jadwaljumlah = ($(jadwaltv).html() || '').match(/<li ?id=\"menu-item-/g) || []
      for (let i = 0; i < (jadwaljumlah.length || 30); i++) {
        let data = $(jadwaltv).find('li').eq(i)
        let channel = $(data).find('a > span').text().trim()
        let url = $(data).find('a').attr('href').trim()
        if (url) url = encodeURI(url)
        jadwal.push({
          channel,
          url
        })
      }
      for (let i = 0; i < jadwal.length; i++) {
        let info = jadwal[i]
        let respons = await fetch(info.url)
        let $ = cheerio.load(await respons.text())
        let matchtotal = ($('article > div.gmr-single-page > div').html() || '').match(/<table ?class=\"table ?table-bordered\">/g) || []
        for (let j = 0; j < (matchtotal.length || 5); j++) {
          let _data = $('article > div.gmr-single-page > div').find('table.table.table-bordered').eq(j).find('tbody')
          if (!$(_data).html()) continue
          let jadwalmatch = ($(_data).html() || '').match(/<tr ?class=\"jklIv\">/g) || []
          for (let n = 0; n < (jadwalmatch.length || 20); n++) {
            let data = $(_data).find('tr.jklIv').eq(n).find('td')
            if (!$(data).html()) continue
            let channel = info.channel
            let waktu = $(data).eq(0).text().trim()
            let acara = $(data).eq(1).text().trim()
            if (!(channel in resultss)) resultss[channel] = []
            resultss[channel].push({
              waktu,
              acara
            })
          }
        }
      }
      if (Object.keys(resultss).length) break
    }
  })()

  ; (async () => {
    let result = {}
    for (let z = 0; z < 10; z++) {
      result = {}
      let response = await fetch('https://www.jadwaltv.net/channel/acara-tv-nasional-saat-ini')
      let $ = cheerio.load(await response.text())
      let tableHtml = $('article[id] > div.gmr-single-page > div')
      let table = ($(tableHtml).html() || '').match(/<table ?class=\"table ?table-bordered\">/g) || []
      for (let i = 0; i < (table.length || 2); i++) {
        let tbodyHtml = $(tableHtml).find('table.table.table-bordered').eq(i).find('tbody')
        let tbody = ($(tbodyHtml).html() || '').match(/<tr><td>?/g) || []
        let lastChannel = { channel: '', index: 1 }
        for (let j = 0; j < (tbody.length || 30); j++) {
          let data = $(tbodyHtml).find('tr').eq(j)
          if (!$(data).html()) continue
          let channel = $(data).find('td[colspan=2] > strong > a').text().trim()
          if (channel) {
            lastChannel.channel = channel
            lastChannel.index = j
          }
          if (j > lastChannel.index) {
            let waktu = $(data).find('td').eq(0).text().trim()
            let acara = $(data).find('td').eq(1).text().trim()
            if (!(lastChannel.channel in result)) result[lastChannel.channel] = []
            result[lastChannel.channel].push({
              waktu,
              acara
            })
          }
        }
      }
      if (Object.keys(result).length) break
    }
    if (Object.keys(result).length) fs.writeFileSync(base + 'acara_aktual.json', JSON.stringify(result, null, 2))
  })()

  ; (async () => {
    let ress = {}
    for (let z = 0; z < 10; z++) {
      let channel = []
      ress = {}
      let url = 'https://www.jadwaltv.net/jadwal-pay-tv'
      let response = await fetch(url)
      let $ = cheerio.load(await response.text())
      let selectorMatch = ($('#channelPayTVDropdown').html() || '').match(/<option ?value=/g) || []
      for (let i = 0; i < (selectorMatch.length || 120); i++) {
        let data = $('#channelPayTVDropdown > option').eq(i)
        if (!$(data).html()) continue
        let channell = $(data).text().trim()
        let link = url + '/' + $(data).attr('value').trim()
        channel.push({
          channel: channell,
          url: link
        })
      }
      for (let i = 0; i < channel.length; i++) {
        let info = channel[i]
        //console.error('[debug]', directory)
        let respons = await fetch(info.url)
        if (!respons.ok) continue
        let $ = cheerio.load(await respons.text())
        let tableHtml = $('article[id] > div.gmr-single-page > div > div[id]')
        let table = ($(tableHtml).html() || '').match(/<table ?class=\"table ?table-bordered\">/g) || []
        for (let j = 0; j < (table.length || 2); j++) {
          let tbodyHtml = $(tableHtml).find('table.table.table-bordered').eq(j).find('tbody')
          let tbody = ($(tbodyHtml).html() || '').match(/<tr><td>?/g) || []
          for (let n = 1; n < ((tbody.length + 1) || 31); n++) {
            let data = $(tbodyHtml).find('tr').eq(n).find('td')
            if (!$(data).html()) continue
            let waktu = $(data).eq(0).text().trim()
            let acara = $(data).eq(1).text().trim()
            if (!(info.channel in ress)) ress[info.channel] = []
            ress[info.channel].push({
              waktu,
              acara
            })
          }
        }
        // console.error('[DEBUG]', info.channel)
      }
      if (Object.keys(ress).length && channel.length) break
    }
    Object.keys(ress).map(data => {
      if (data in resultss && ress[data].length) resultss[data].push(...ress[data])
      else resultss[data] = ress[data]
    })
    if (Object.keys(resultss).length) fs.writeFileSync(base + 'jadwaltv.json', JSON.stringify(resultss, null, 2))
  })()