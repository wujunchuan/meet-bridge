/*
 * MEET桥接
 * @Author: JohnTrump
 * @Date: 2018-08-06 16:26:02
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-08-07 15:38:31
 */

export default class Bridge {
  schema: string

  constructor(schema: string = 'meetone://') {
    this.schema = schema
  }

  /**
   * 将对象转换成URL参数,并且完成编码
   * 编码的过程: JSON化 -> url编码 -> Base64编码
   *
   * @author JohnTrump
   * @static
   * @param {object} obj 需要编码的对象
   * @returns {string} 编码后的值
   * @memberof Bridge
   */
  public static coverObjectToParams(obj: object): string {
    try {
      let json = JSON.stringify(obj)
      return btoa(encodeURIComponent(json))
    } catch (error) {
      console.error(error)
    }
    return ''
  }

  // 将URL参数解码并且转换成对象
  // 解码过程： base64解码 -> url解码 -> JSON化
  public static revertParamsToObject(url: string): object {
    try {
      // decode base64
      const decodeURL = atob(url)
      const jsonStr = decodeURIComponent(decodeURL)
      return JSON.parse(jsonStr)
    } catch (error) {
      console.error(error)
    }
    return {}
  }

  // 解析URL
  public static parseURL(url: string): object {
    let a = document.createElement('a')
    a.href = url
    return {
      source: url,
      protocol: a.protocol.replace(':', ''),
      host: a.hostname,
      port: a.port,
      query: a.search,
      params: (function() {
        let ret = {},
          seg = a.search.replace(/^\?/, '').split('&'),
          len = seg.length,
          i = 0,
          s
        for (; i < len; i++) {
          if (!seg[i]) {
            continue
          }
          s = seg[i].split('=')
          ret[s[0]] = s[1]
        }
        return ret
      })(),
      file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
      hash: a.hash.replace('#', ''),
      path: a.pathname.replace(/^([^\/])/, '/$1'),
      relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
      segments: a.pathname.replace(/^\//, '').split('/')
    }
  }

  // 生成协议URI地址
  public generateURI({ routeName = '', params = {}, callbackId = '' }): string {
    return this.schema
      .concat(routeName)
      .concat('?params=')
      .concat(Bridge.coverObjectToParams(params))
      .concat('&callbackId=' + callbackId)
  }

  // 请求获取授权
  public invokeAuthorizeWeb({ callbackId = '' } = {}): string {
    return this.generateURI({
      routeName: 'eos/authorizeInWeb',
      params: {},
      callbackId
    })
  }

  // 发起转账请求
  public invokeTransfer({
    to = '',
    amount = 0,
    tokenName = 'EOS',
    tokenContract = 'eosio.token',
    tokenPrecision = 4,
    memo = '',
    orderInfo = '',
    callbackId = ''
  }): string {
    return this.generateURI({
      routeName: 'eos/transfer',
      params: {
        to,
        amount,
        tokenName,
        tokenContract,
        tokenPrecision,
        memo,
        orderInfo
      },
      callbackId
    })
  }

  // 发起事务请求
  public invokeTransaction({
    actions = [],
    options = { broadcast: true },
    callbackId = ''
  }): string {
    return this.generateURI({
      routeName: 'eos/transaction',
      params: {
        actions,
        options
      },
      callbackId
    })
  }

  // 获取帐号信息
  public invokeAccountInfo({ callbackId = '' }): string {
    return this.generateURI({
      routeName: 'eos/account_info',
      params: {},
      callbackId
    })
  }
}
