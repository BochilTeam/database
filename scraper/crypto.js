const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')

let base = './ekonomi/'
if (!fs.existsSync(base)) {
  fs.mkdirSync(base, { recursive: true })
}

; (async () => {
  let results = []
  let response = await fetch('https://coinmarketcap.com/id/')
  let $ = cheerio.load(await response.text())
  $('#__next > div > div.main-content > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div:nth-child(1) > div[style="overflow-x:scroll"] > table > tbody > tr').each(function (i) {
    let table = $(this).find('td')
    if (i < 10) {
      let iconElement = table.eq(2).find('div > a > div > img')
      let element24Jam = table.eq(4).find('span')
      let element7Hari = table.eq(5).find('span')
      let kapPasarElement = table.eq(6).find('p > span')
      let volume24JamElement = table.eq(7).find('div')
      results.push({
        peringkat: parseInt(table.eq(1).find('p').text() || i),
        nama: table.eq(2).find('div > a > div > div > p').text(),
        singkatan: table.eq(2).find('div > a > div > div > div > p').text() || '',
        icon: iconElement.attr('src') || iconElement.attr('alt') || '',
        harga: table.eq(3).find('div > a').text() || '-',
        '24jam': (/up/gi.test(element24Jam.find('span').attr('class') || '') ? '↑ ' : '↓ ') + element24Jam.text(),
        '7hari': (/up/gi.test(element7Hari.find('span').attr('class') || '') ? '↑ ' : '↓ ') + element7Hari.text(),
        kapPasar: kapPasarElement.eq(1).text(),
        kapPasarM: kapPasarElement.eq(0).text() || '',
        volume24Jam: volume24JamElement.find('a > p').text(),
        volumeCrypto24Jam: volume24JamElement.find('p').text(),
        peredaran: table.eq(8).find('div > div.sc-16r8icm-0.g5oqcc-1.eGQXzN > p').text(),
        grafik7Hari: table.eq(9).find('a > img').attr('src') || '',
        suplaiTotal: table.eq(10).text() 
      })
    }
  })
  if (results.length) fs.writeFileSync(base + 'crypto.json', JSON.stringify(results, null, 2))
})()