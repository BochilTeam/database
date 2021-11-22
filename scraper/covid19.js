const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')

let base = './covid19/'
if (!fs.existsSync(base)) {
  fs.mkdirSync(base, { recursive: true })
}

; (async () => {
  let results = []
  let res = await (await fetch('https://www.antaranews.com/covid-19')).text()
  let $ = cheerio.load(res)
  $('#main-container > div.main-content.mag-content.clearfix > div > div.col-md-8 > div:nth-child(3) > table > tbody > tr').each(function (i) {
    let data = $(this).find('td')
    results.push({
      wilayah: $(data).eq(0).text().trim(),
      dirawat: {
        terakhir: $(data).eq(1).text().trim()
      },
      terkonfirmasi: {
        terakhir: $(data).eq(2).text().trim()
      },
      sembuh: {
        terakhir: $(data).eq(3).text().trim()
      },
      meninggal: {
        terakhir: $(data).eq(4).text().trim()
      }
    })
  })
  if (results.length) fs.writeFileSync(base + 'indonesia.json', JSON.stringify(results, null, 2))
})()

; (async () => {
  let cases = await (await fetch('https://tradingeconomics.com/country-list/coronavirus-cases')).text()
  let deaths = await (await fetch('https://tradingeconomics.com/country-list/coronavirus-deaths')).text()
  let recovered = await (await fetch('https://tradingeconomics.com/country-list/coronavirus-recovered')).text()
  let vaccination = await (await fetch('https://tradingeconomics.com/country-list/coronavirus-vaccination-total')).text()
  let $cases = cheerio.load(cases)
  let $deaths = cheerio.load(deaths)
  let $recovered = cheerio.load(recovered)
  let $vaccination = cheerio.load(vaccination)
  let data = []
  $cases('#ctl00_ContentPlaceHolder1_ctl02_UpdatePanel1 > div > div > table > tbody > tr').each(function (i, el) {
    let table = $cases(this).find('td')
    let negara = table.eq(0).find('a').text().trim()
    let terakhir = parseInt(table.eq(1).text().trim())
    let sebelumnya = parseInt(table.eq(2).text().trim())
    data.push({
      wilayah: negara,
      terkonfirmasi: {
        terakhir,
        sebelumnya,
        penambahan: (terakhir - sebelumnya)
      }
    })
  })
  $recovered('#ctl00_ContentPlaceHolder1_ctl01_UpdatePanel1 > div > div > table > tbody > tr').each(function (i, el) {
    let table = $recovered(this).find('td')
    let negara = table.eq(0).find('a').text().trim()
    let terakhir = parseInt(table.eq(1).text().trim())
    let sebelumnya = parseInt(table.eq(2).text().trim())
    let result = data.find(v => v.wilayah.toLowerCase() === negara.toLowerCase())
    let index = data.indexOf(result)
    if (index === -1) data.push({
      wilayah: negara,
      sembuh: {
        terakhir,
        sebelumnya,
        penambahan: (terakhir - sebelumnya)
      }
    })
    else {
      data[index] = {
        ...data[index],
        sembuh: {
          terakhir,
          sebelumnya,
          penambahan: (terakhir - sebelumnya)
        }
      }
    }
  })
  $deaths('#ctl00_ContentPlaceHolder1_ctl01_UpdatePanel1 > div > div > table > tbody > tr').each(function (i, el) {
    let table = $deaths(this).find('td')
    let negara = table.eq(0).find('a').text().trim()
    let terakhir = parseInt(table.eq(1).text().trim())
    let sebelumnya = parseInt(table.eq(2).text().trim())
    let result = data.find(v => v.wilayah.toLowerCase() === negara.toLowerCase())
    let index = data.indexOf(result)
    if (index === -1) data.push({
      wilayah: negara,
      meninggal: {
        terakhir,
        sebelumnya,
        penambahan: (terakhir - sebelumnya)
      }
    })
    else {
      data[index] = {
        ...data[index],
        meninggal: {
          terakhir,
          sebelumnya,
          penambahan: (terakhir - sebelumnya)
        }
      }
    }
  })
  $vaccination('#ctl00_ContentPlaceHolder1_ctl02_UpdatePanel1 > div > div > table > tbody > tr').each(function (i, el) {
    let table = $vaccination(this).find('td')
    let negara = table.eq(0).find('a').text().trim()
    let terakhir = parseInt(table.eq(1).text().trim())
    let sebelumnya = parseInt(table.eq(2).text().trim())
    let result = data.find(v => v.wilayah.toLowerCase() === negara.toLowerCase())
    let index = data.indexOf(result)
    if (index === -1) data.push({
      wilayah: negara,
      vaksin: {
        terakhir,
        sebelumnya,
        penambahan: (terakhir - sebelumnya)
      }
    })
    else {
      data[index] = {
        ...data[index],
        vaksin: {
          terakhir,
          sebelumnya,
          penambahan: (terakhir - sebelumnya)
        }
      }
    }
  })
  if (data.length) fs.writeFileSync(base + 'global.json', JSON.stringify(data, null, 2))
})()