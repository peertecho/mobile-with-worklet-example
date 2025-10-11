import b4a from 'b4a'
import { useState, useEffect } from 'react'
import { Worklet } from 'react-native-bare-kit'
import { Paths } from 'expo-file-system'

import bundle from '../worklet/app.bundle.mjs'

const worklet = new Worklet()
worklet.start('/app.bundle', bundle)
const { IPC } = worklet

const useWorklet = () => {
  const [error, setError] = useState('')
  const [healthCheck, setHealthCheck] = useState('')

  useEffect(() => {
    IPC.on('data', (data: Uint8Array) => {
      const lines = b4a.toString(data).split('\n')
      for (let msg of lines) {
        msg = msg.trim()
        if (!msg) continue
        const obj = parseMsg(msg)

        if (obj.tag === 'error') {
          console.log('Error from worklet:', obj.data)
          setError(msg)
        } else if (obj.tag === 'data') {
          onData(obj.data, obj)
        } else {
          console.log('Unknown message from worklet:', msg)
        }
      }
    })
    write('ready', { 
      documentDirectory: Paths.document.uri.substring('file://'.length)
    })
  }, [])

  function onData (data: any, obj: any) {
    if (data?.event === 'pong') {
      setHealthCheck(JSON.stringify({ data, at: obj.at }))
    } else {
      console.log('Data from worklet:', data)
    }
  }

  return { 
    error, 
    healthCheck,
    write: (data: any) => write('data', data)
  }
}

function write (tag: string, data?: any) {
  IPC.write(b4a.from(JSON.stringify({ tag, data, at: new Date().toISOString() }) + '\n'))
}

function parseMsg (msg: string) {
  try {
    return JSON.parse(msg)
  } catch {
    return { tag: 'unknown', data: msg }
  }
}

export default useWorklet
