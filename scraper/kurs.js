const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs') 

; (async () => {
  let response = await fetch('https://www.bi.go.id/id/statistik/informasi-kurs/transaksi-bi/default.aspx')
  let $ = cheerio.load(await response.text())
  let result = [], uang = []
  for (let i = 0; i < 25; i++) {
    let data = $('#exampleModal > div > div > div.modal-body > div > table > tbody > tr').eq(i).find('td')
    let singkatan_mata_uang = $(data).eq(0).text()
    let kepanjangan_mata_uang = $(data).eq(1).text()
    uang.push({ singkatan_mata_uang, kepanjangan_mata_uang })
  }
  for (let i = 0; i < 25; i++) {
    let data = $('#ctl00_PlaceHolderMain_g_6c89d4ad_107f_437d_bd54_8fda17b556bf_ctl00_GridView1 > table > tbody > tr').eq(i).find('td')
    let mata_uang = $(data).eq(0).text().trim()
    let _nama_mata_uang = uang.filter(v => new RegExp(mata_uang, 'g').test(v.singkatan_mata_uang)) || [{}]
    let nama_mata_uang = (_nama_mata_uang[0] && _nama_mata_uang[0].kepanjangan_mata_uang ? _nama_mata_uang[0].kepanjangan_mata_uang : '').trim() || ''
    result.push({
      mata_uang,
      nama_mata_uang,
      kurs_beli: $(data).eq(2).text(),
      kurs_jual: $(data).eq(3).text(),
    })
  }

  await fs.writeFileSync('./ekonomi/kurs.json', JSON.stringify(result, null, 2))
})()