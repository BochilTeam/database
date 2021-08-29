const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')

let base = './ekonomi/'
if (!fs.existsSync(base)){
  fs.mkdirSync(base, { recursive: true })
}

; (async () => {
  let result = []
  for (let z = 0; z < 10; z++) {
    result = []
    let response = await fetch('https://coinmarketcap.com/id/')
    let $ = cheerio.load(await response.text())
    let table = $('#__next > div > div.main-content > div.sc-57oli2-0.comDep.cmc-body-wrapper > div > div:nth-child(1) > div.h7vnx2-1.bFzXgL > table > tbody').html() || ''
    let tr = table.match(/tr/g) || []
    for (let i = 0; i < (tr.length || 100); i++) {
      let data = $('#__next > div > div.main-content > div.sc-57oli2-0.comDep.cmc-body-wrapper > div > div:nth-child(1) > div.h7vnx2-1.bFzXgL > table > tbody').find('tr').eq(i).find('td')
      if (!$(data).html()) continue
      let icon, peringkat, nama, simbol, harga, icon_24_jam, _24_jam, icon_1_minggu, _1_minggu, kap_pasar, volume_24_jam, peredaran_suplai, _7_hari_terakhir
      if (i < 10) {
        peringkat = $(data).eq(1).find('p').text()
        icon = $(data).eq(2).find('div > a > div > img').attr('src')
        nama = $(data).eq(2).find('div > a > div > div > p').text().trim().toLowerCase()
        simbol = $(data).eq(2).find('div > a > div > div > div > p').text().trim().toUpperCase()
        harga = $(data).eq(3).find('div > a').text().trim()
        icon_24_jam = ($(data).eq(4).find('span > span').attr('class') || '').replace(/[Ii]con-[Cc]aret-/g, '')
        _24_jam = (icon_24_jam && icon_24_jam == 'up' ? '↑ ' : '↓ ') + $(data).eq(4).find('span').text().trim()
        icon_1_minggu = ($(data).eq(5).find('span > span').attr('class') || '').replace(/[Ii]con-[Cc]aret-/g, '')
        _1_minggu = (icon_1_minggu && icon_1_minggu == 'up' ? '↑ ' : '↓ ') + $(data).eq(5).find('span').text().trim()
        kap_pasar = $(data).eq(6).find('p > span').eq(1).text().trim()
        volume_24_jam = $(data).eq(7).find('div > a > p').text().trim()
        peredaran_suplai = $(data).eq(8).find('div > div > p').text().trim()
        _7_hari_terakhir = $(data).eq(9).find('a > img').attr('src')
      } else {
        nama = $(data).eq(2).find('a > span').eq(1).text().trim()
        simbol = $(data).eq(2).find('a > span').eq(2).text().trim()
        harga = $(data).eq(3).find('span').text().trim()
      }
      //if (!peringkat || !nama || !simbol || !harga || !_24_jam || !_1_minggu || !kap_pasar || !volume_24_jam || !peredaran_suplai || !_7_hari_terakhir) continue
      result.push({
        peringkat,
        nama,
        simbol,
        harga,
        _24_jam,
        _1_minggu,
        kap_pasar,
        volume_24_jam,
        peredaran_suplai,
        _7_hari_terakhir
      })
    }
    if (result.length) break
  }
  if (result.length) await fs.writeFileSync(base + 'crypto.json', JSON.stringify(result, null, 2))
})()