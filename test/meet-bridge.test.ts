/*
 * MEETONE Bridge 测试用例
 * @Author: JohnTrump
 * @Date: 2018-08-06 16:25:08
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-08-07 15:07:36
 */

import Bridge from '../src/meet-bridge'

describe('init testingv', () => {
  it('Bridge is a Class', () => {
    expect(Bridge).toBeDefined()
  })

  it('Bridge.scheme default is `meetone://`', () => {
    expect(new Bridge()).toBeInstanceOf(Bridge)
    expect(new Bridge().scheme).toBe('meetone://')
  })

  it('可以修改scheme的参数', () => {
    expect(new Bridge('moreone://').scheme).toBe('moreone://')
  })
})

describe('测试编码与对象之间的转换', () => {
  const targetObj = {
    to: 'wujunchuan12', // 收款地址
    amount: 1, // 金额
    tokenName: 'EOS', // 代币名称， 转账金额传参需要带上
    tokenContract: 'eosio.token', // Token合约地址
    tokenPrecision: 4, // token的精度
    memo: '我只是来测试的', // 这个Memo可能是合约需要用到的参数，与订单详情说明的意义不一样，订单详情说明只是给用户展示的一个字段，而memo是合约要用到的
    orderInfo: '邀请码购买' // 订单详情说明
  }
  const result = Bridge.coverObjectToParams(targetObj)

  const reverObj = Bridge.revertParamsToObject(result)

  it('编码与对象之间的转换', () => {
    // 编码与解编码后的对象应该是一致的
    expect(reverObj).toEqual(targetObj)
  })
})

describe('生成协议URI地址', () => {
  const bridge = new Bridge()
  const url = bridge.generateURI({
    routeName: 'eos/account_info',
    params: {}
  })
  it('生成协议URI地址', () => {
    expect(url).toEqual(expect.stringMatching('eos/account_info'))
  })
})

describe('测试ParseURL', () => {
  const url = 'meetone://eos/authorizeInWeb?params=JTdCJTdE&callbackId=100#MyHash'
  it('返回source', () => {
    expect(Bridge.parseURL(url)).toMatchObject({
      source: url
    })
  })
  it('解析出URL的关键信息', () => {
    expect(Bridge.parseURL(url)).toMatchObject({
      source: url,
      protocol: 'meetone'
    })
  })
  it('获取参数', () => {
    const urlObj = Bridge.parseURL(url)
    const paramsObj = urlObj.params
    expect(Bridge.revertParamsToObject(paramsObj.params)).toEqual({})
  })
})

describe('测试SDK', () => {
  const bridge = new Bridge()

  it('请求获取授权(跳转到授权页面)', () => {
    const url = bridge.invokeAuthorize({ callbackId: '100' })
    const urlObj = Bridge.parseURL(url)
    const paramsObj = urlObj.params
    expect(url).toEqual(expect.stringMatching('eos/authorize'))
    expect(Bridge.revertParamsToObject(paramsObj.params)).toEqual({
      dappIcon: null,
      dappName: null,
      loginMemo: null,
      scheme: null,
      redirectURL: null
    })
  })

  it('请求获取授权(直接返回授权信息)', () => {
    const url = bridge.invokeAuthorizeInWeb({ callbackId: '100' })
    const urlObj = Bridge.parseURL(url)
    const paramsObj = urlObj.params
    expect(url).toEqual(expect.stringMatching('eos/authorizeInWeb'))
    expect(Bridge.revertParamsToObject(paramsObj.params)).toEqual({})
  })

  it('发起转账请求', () => {
    const transferConfig = {
      to: 'wujunchuan12', // 收款地址
      amount: 1, // 金额
      tokenName: 'EOS', // 代币名称， 转账金额传参需要带上
      tokenContract: 'eosio.token', // Token合约地址
      tokenPrecision: 4, // token的精度
      memo: '我只是来测试的', // 这个Memo可能是合约需要用到的参数，与订单详情说明的意义不一样，订单详情说明只是给用户展示的一个字段，而memo是合约要用到的
      orderInfo: '邀请码购买' // 订单详情说明
    }
    const url = bridge.invokeTransfer(Object.assign({}, transferConfig, { callbackId: '100' }))
    const urlObj = Bridge.parseURL(url)
    const paramsObj = urlObj.params
    expect(url).toEqual(expect.stringMatching('eos/transfer'))
    expect(Bridge.revertParamsToObject(paramsObj.params)).toEqual(transferConfig)
  })

  it('发起事务请求', () => {
    const transactionActions = [
      {
        account: 'eosio.token',
        name: 'transfer',
        authorization: [
          {
            actor: 'wujunchuan11', // creator
            permission: 'active'
          }
        ],
        data: {
          from: 'wujunchuan11', // creator
          to: 'wujunchuan12',
          quantity: '1.0000 EOS',
          memo: 'transaction-bridge test'
        }
      }
    ]

    const url = bridge.invokeTransaction({
      actions: transactionActions
    })
    const urlObj = Bridge.parseURL(url)
    const paramsObj = urlObj.params
    expect(url).toEqual(expect.stringMatching('eos/transaction'))
    expect(Bridge.revertParamsToObject(paramsObj.params).actions).toEqual(transactionActions)
  })

  it('获取帐号信息', () => {
    const url = bridge.invokeAccountInfo({})
    expect(url).toEqual(expect.stringMatching('eos/account_info'))
  })

  it('唤起转账页面', () => {
    const config = {
      to: 'wujunchuan12'
    }
    const url = bridge.invokeTransferPage(config)
    const urlObj = Bridge.parseURL(url)
    const paramsObj = urlObj.params
    expect(url).toEqual(expect.stringMatching('eos/transfer_page'))
    expect(Bridge.revertParamsToObject(paramsObj.params)).toMatchObject(config)
  })

  it('协议跳转', () => {
    const config = {
      target: 'CandyPage'
    }
    const url = bridge.invokeNavigate(config)
    const urlObj = Bridge.parseURL(url)
    const paramsObj = urlObj.params
    expect(url).toEqual(expect.stringMatching('app/navigate'))
    expect(Bridge.revertParamsToObject(paramsObj.params)).toMatchObject(config)
  })

  it('协议打开webview', () => {
    const config = {
      url: 'https://meet.one',
      title: '米特旺'
    }
    const url = bridge.invokeWebview(config)
    console.log(url)
    const urlObj = Bridge.parseURL(url)
    const paramsObj = urlObj.params
    expect(url).toEqual(expect.stringMatching('app/webview'))
    expect(Bridge.revertParamsToObject(paramsObj.params)).toMatchObject(config)
  })
})
