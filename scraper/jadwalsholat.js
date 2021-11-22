const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')

let base = './islam/'
if (!fs.existsSync(base)) {
    fs.mkdirSync(base, { recursive: true })
}

let headers = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9,id;q=0.8',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
}

let lists = [{
    id: '0',
    nama: 'Jakarta Pusat'
}]
let results = []
    ; (async () => {
        let res = await fetch('https://jadwalsholat.org/jadwal-sholat/monthly.php', { headers })
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
        if (lists.length == 1) return
        for (let list of lists) {
            let res = await fetch(`https://jadwalsholat.org/jadwal-sholat/monthly.php?id=${list.id}`, { headers })
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
            if (!isNaN(parseInt(td.eq(0).find('b').text())))
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