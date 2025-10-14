/* eslint-disable no-undef */
const { IPC } = BareKit
const fs = require('fs')
const path = require('path')

IPC.on('data', async (data) => {
  const lines = data.toString().split('\n')
  for (let msg of lines) {
    msg = msg.trim()
    if (!msg) continue

    const obj = JSON.parse(msg)
    if (obj.tag === 'ping') {
      write('pong', new Date().toISOString())
    } else if (obj.tag === 'test-fs') {
      const res = await testFs(obj.data)
      write('res-fs', res)
    }
  }
})

function write (tag, data) {
  IPC.write(Buffer.from(JSON.stringify({ tag, data }) + '\n'))
}

async function testFs (dir) {
  const file = path.join(dir, 'hello.txt')
  await fs.promises.writeFile(file, 'Hello from Worklet!', 'utf8')
  const res = await fs.promises.readFile(file, 'utf8')
  return res
}
