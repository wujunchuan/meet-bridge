import EOS from '../src/meet-eos';

// 测试节点配置信息
let config = {
  keyProvider: '5J7mBfHhBznU3KsD6wDKVFYEKY6ak8k8PLGCtTftgcKh3vDBQB8',
  httpEndpoint: 'http://dev.cryptolions.io:38888',
  expireInSeconds: 60,
  broadcast: true,
  debug: true,
  sign: true,
  chainId: '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'
}

let eos = new EOS(config)

/**
 * EOS.getInfo() test
 */
describe('EOS initial Test', () => {
  it('config is not null', () => {
    expect(config).not.toBeNull()
  })

  it('EOS.getInstance() will return eos Object', () => {
    expect(eos.getInstance()).toMatchObject(eos)
  })

  it('EOS.getInfo() will return the chain info', () => {
    return eos.getInfo(resultData => {
      expect(resultData.chain_id).toEqual(config.chainId)
    })
  })

  it('获取帐号信息,以wujunchuan11为例', () => {
    const accountName = 'wujunchuan11'
    return eos.getAccount(accountName, (err, result) => {
      expect(result.account_name).toEqual(accountName)
    })
  })
})
