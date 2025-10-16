import b4a from 'b4a'
import { useState, useEffect } from 'react'
import { Worklet } from 'react-native-bare-kit'
import { StyleSheet, Text, View } from 'react-native'

import bundle from './worklet/app.bundle.mjs'

const worklet = new Worklet()
worklet.start('/app.bundle', bundle)
const { IPC } = worklet

export default function App () {
  const [response, setResponse] = useState('')

  useEffect(() => {
    IPC.on('data', (data) => setResponse(b4a.toString(data)))
    IPC.write(b4a.from('Hello from React Native!'))
  }, [])

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Text>Response from worklet: {response}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
