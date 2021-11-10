const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')

let base = './islam/'
if (!fs.existsSync(base)) {
    fs.mkdirSync(base, { recursive: true })
}

let lists = [{
    id: '0',
    nama: 'Jakarta Pusat'
}]
let results = []
    ; (async () => {
        let res = await fetch('https://jadwalsholat.org/jadwal-sholat/monthly.php')
        if (!res.ok) return
        let html = await res.text()
        let $ = cheerio.load(html)
        $('body > table > tbody > tr.table_navigasi > td > table > tbody > tr > td:nth-child(2) > select > option').each(function (i) {
            lists.push({
                id: $(this).attr('value'),
                nama: $(this).text()
            })
        })
    })()

    ; (async () => {
        for (let list of lists) {
            let res = await fetch(`https://jadwalsholat.org/jadwal-sholat/monthly.php?id=${list.id}`)
            if (!res.ok) return
            let html = await res.text()
            results.push({
                ...list,
                jadwal: scrapeJadwalSholat(html),
            })
        }
        if (results.length) fs.writeFileSync(base + 'jadwalSholat.json', JSON.stringify(results, null, 2))
    })()

function scrapeJadwalSholat(html) {
    let res = []
    let $ = cheerio.load(html)
    $('body > table > tbody > tr').each(function (i) {
        if (i >= 3) {
            let td = $(this).find('td')
            if (td.eq(0).find('b').text())
                res.push({
                    tanggal: td.eq(0).find('b').text(),
                    imsyak: td.eq(1).text(),
                    shubuh: td.eq(2).text(),
                    terbit: td.eq(3).text(),
                    dhuha: td.eq(4).text(),
                    dzuhur: td.eq(5).text(),
                    ahsr: td.eq(6).text(),
                    magrib: td.eq(7).text(),
                    isya: td.eq(8).text()
                })
        }
    })
    return res
}