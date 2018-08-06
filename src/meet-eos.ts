import eosjs from 'eosjs'

interface Config {
  keyProvider: string
  httpEndpoint: string
  expireInSeconds: number
  broadcast: boolean
  debug: boolean
  sign: boolean
  chainId: string
}

export default class EOS {
  public eos: any

  constructor(config: Config) {
    this.eos = new eosjs(config)
  }

  getInstance() {
    return this
  }

  getInfo(callback: any) {
    this.eos.getInfo({}).then((res: any) => {
      callback && callback(res)
    })
  }

  getAccount(accountName: string, callback: any) {
    this.eos.getAccount({ account_name: accountName }).then((res: any) => {
      callback && callback(null, res)
    })
  }
}
