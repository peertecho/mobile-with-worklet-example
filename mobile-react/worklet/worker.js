const ReadyResource = require('ready-resource')

class Worker extends ReadyResource {
  constructor (storage, opts = {}) {
    super()

    this.storage = storage
    this.opts = opts
  }

  async _open () {
    const { opts } = this

    opts.write('data', { event: 'ready', storage: this.storage })
  }

  async _close () {
    const { opts } = this

    opts.write('data', { event: 'closed' })
  }

  async write (data, obj) {
    const { opts } = this

    if (data?.event === 'ping') {
      opts.write('data', { event: 'pong', at: obj.at })
    }
  }
}

module.exports = Worker
