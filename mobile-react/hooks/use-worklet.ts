import b4a from 'b4a'
import { useState, useEffect } from 'react'
import { Worklet } from 'react-native-bare-kit'
import { Paths } from 'expo-file-system'

import bundle from '../worklet/app.bundle.mjs'

const worklet = new Worklet()
worklet.start('/app.bundle', bundle)
const { IPC } = worklet

const useWorklet = () => {
  const [pingRes, setPingRes] = useState('')
  const [fsRes, setFsRes] = useState('')

  useEffect(() => {
    IPC.on('data', (data) => {
      const lines = b4a.toString(data).split('\n')
      for (let msg of lines) {
        msg = msg.trim()
        if (!msg) continue

        const obj = JSON.parse(msg)
        if (obj.tag === 'pong') {
          setPingRes(obj.data)
        } else if (obj.tag === 'res-fs') {
          setFsRes(obj.data)
        }
      }
    })

    write('test-fs', Paths.document.uri.substring('file://'.length))

    const interval = setInterval(() => write('ping'), 1000)
    return () => {
      clearInterval(interval)
      IPC.end()
    }
  }, [])

  return { pingRes, fsRes }
}

function write (tag: string, data?: any) {
  IPC.write(b4a.from(JSON.stringify({ tag, data }) + '\n'))
}

export default useWorklet
