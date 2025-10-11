/* eslint-disable no-undef */
require('bare-process/global')
const { IPC } = BareKit
const fs = require('fs')
const path = require('path')

const Worker = require('./worker')
let worker = null

process.on('uncaughtException', (err) => {
  write('error', `${err?.stack || err}`)
})
process.on('unhandledRejection', (err) => {
  write('error', `${err?.stack || err}`)
})
IPC.on('error', (err) => {
  write('error', `${err}`)
})
IPC.on('data', async (data) => {
  try {
    const lines = data.toString().split('\n')
    for (let msg of lines) {
      msg = msg.trim()
      if (!msg) continue
      const obj = parseMsg(msg)

      if (obj.tag === 'ready') {
        await onReady(obj.data)
      } else if (obj.tag === 'close') {
        await onclose()
      } else if (obj.tag === 'data') {
        await worker?.write(obj.data, obj)
      } else {
        write('error', msg)
      }
    }
  } catch (err) {
    write('error', `${err?.stack || err}`)
  }
})

async function onReady ({ documentDirectory }) {
  await testFsReadWrite(documentDirectory)

  const storage = path.join(documentDirectory, 'storage')
  worker = new Worker(storage, {
    write: (tag, data) => write(tag, data)
  })
  await worker.ready()
}

async function onclose () {
  await worker?.close()
  IPC.end()
}

async function testFsReadWrite (documentDirectory) {
  const testFile = path.join(documentDirectory, 'hello.txt')
  await fs.promises.writeFile(testFile, 'Hello World!', 'utf8')
  const test = await fs.promises.readFile(testFile, 'utf8')
  write('data', { event: 'test', test })
}

function write (tag, data) {
  IPC.write(Buffer.from(JSON.stringify({ tag, data, at: new Date().toISOString() })+ '\n'))
}

function parseMsg (msg) {
  try {
    return JSON.parse(msg)
  } catch {
    return { tag: 'unknown', data: msg }
  }
}
