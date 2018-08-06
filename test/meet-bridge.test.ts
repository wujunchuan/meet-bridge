/*
 * MEETONE Bridge 测试用例
 * @Author: JohnTrump
 * @Date: 2018-08-06 16:25:08
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-08-06 16:32:26
 */

import Bridge from '../src/meet-bridge'

describe('init testingv', () => {
  it('Bridge is a Class', () => {
    expect(Bridge).toBeDefined()
  })

  it('Bridge.scheme default is `meetone://`', () => {
    expect(new Bridge()).toBeInstanceOf(Bridge)
    expect(new Bridge().schema).toBe('meetone://')
  })

  it('可以修改schema的参数', () => {
    expect(new Bridge('moreone://').schema).toBe('moreone://')
  })
})

describe('测试编码与对象之间的转换', () => {
  const bridge = new Bridge()
  const targetObj = {
    to: 'wujunchuan12', // 收款地址
    amount: 1, // 金额
    tokenName: 'EOS', // 代币名称， 转账金额传参需要带上
    tokenContract: 'eosio.token', // Token合约地址
    tokenPrecision: 4, // token的精度
    memo: '我只是来测试的', // 这个Memo可能是合约需要用到的参数，与订单详情说明的意义不一样，订单详情说明只是给用户展示的一个字段，而memo是合约要用到的
    orderInfo: '邀请码购买' // 订单详情说明
  }
  const result = bridge._coverObjectToParams(targetObj)

  const reverObj = bridge._revertParamsToObject(result)

  it('编码与对象之间的转换', () => {
    // 编码与解编码后的对象应该是一致的
    expect(reverObj).toEqual(targetObj)
  })
})
