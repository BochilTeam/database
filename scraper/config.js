const fs = require('fs')

let filename = './ekonomi/crypto.json'
let old = JSON.parse(JSON.stringify(fs.readFileSync(filename).toString('base64')))
let fsWait = false
let watch = fs.watch(filename, async (event, filename) => {
  if (event !== 'change' && !filename) return
  if (fsWait) return
  fsWait = setTimeout(() => {
    fsWait = false
  }, 100)
  console.log(fsWait)
  let neww = JSON.parse(JSON.stringify(fs.readFileSync(filename).toString('base64')))
  if (neww == old) return
  old = neww

  let o
  try {
    o = await exec('git config user.name "github-actions"')
  } catch (e) {
    o = e
  } finally {
    let { stdout, stderr } = o
    if (stdout) console.log(stdout.toString().trim())
    if (stderr) console.log(stderr.toString().trim())
  }
})

module.exports = watch

async function exec(command) {
  let cp = require('child_process')
  let { promisify } = require('util')
  let spawn = promisify(cp.exec).bind(cp)
  return await spawn(command)
}
