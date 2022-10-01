import AnyProxy, { ProxyOptions, RuleModule } from 'anyproxy'

import { exec } from 'child_process'
import process from 'process'

if (!AnyProxy.utils.certMgr.ifRootCAFileExists()) {
  AnyProxy.utils.certMgr.generateRootCA((error, keyPath) => {
    if (!error) {
      const certDir = require('path').dirname(keyPath)
      const isWin = /^win/.test(process.platform)
      if (isWin) {
        exec('start .', { cwd: certDir })
      } else {
        exec('open .', { cwd: certDir })
      }
    } else {
      console.error('ca file generate failed: ', error)
    }
  })
}

const rule: RuleModule = {
  beforeSendRequest(requestDetail) {
    return null
  },
  beforeSendResponse(requestDetail, responseDetail) {
    return null
  }
}

const options: ProxyOptions = {
  port: 9999,
  rule,
  forceProxyHttps: true,
  webInterface: {
    enable: true,
    webPort: 8002
  },
  silent: true
}

const proxyServer = new AnyProxy.ProxyServer(options)

proxyServer.on('ready', function () {
  console.log('servcie proxy ready.')
})

proxyServer.on('error', function (e) {
  console.log(e)
})

proxyServer.start()
