/*
 * MEET桥接
 * @Author: JohnTrump
 * @Date: 2018-08-06 16:26:02
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-08-07 19:46:44
 */

export default class Bridge {
  /**
   * 指定协议头,默认为meetone://
   * @type {string}
   * @memberof Bridge
   */
  schema: string

  /**
   * Creates an instance of Bridge.
   * @param {string} [schema='meetone://']
   * @memberof Bridge
   */
  constructor(schema: string = 'meetone://') {
    this.schema = schema
  }

  /**
   * 将对象转换成URL参数,并且完成编码
   *
   * 编码的过程: JSON化 -> url编码 -> Base64编码
   * @static
   * @param {object} obj 需要编码的对象
   * @returns {string} 经过系列编码后的值
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

  /**
   * 将URL参数解码并且转换成对象
   *
   * 解码过程： base64解码 -> url解码 -> JSON化
   *
   * @static
   * @param {string} url 需要解码的URL
   * @returns {object} URL中Query部分的params字段所代表的对象
   * @memberof Bridge
   */
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

  /**
   * 解析URL
   *
   * @static
   * @param {string} url 需要解析的URL
   * @returns {object} 解析出的对象
   * @memberof Bridge
   */
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
        let ret = {} as any,
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

  /**
   * 生成协议URI地址
   *
   * Web端可以通过下面两种调用方式与客户端进行通讯桥接
   *
   * 1. window.location.href = uri (外部web调用)
   *
   * 2. window.postMessage(uri) (内部Webview调用)
   *
   * @param routeName 路由名称
   * @param params 查询的参数
   * @param callbackId 回调Id
   * @returns {string}
   * @memberof Bridge
   */
  public generateURI({ routeName = '', params = {}, callbackId = '' }): string {
    return this.schema
      .concat(routeName)
      .concat('?params=')
      .concat(Bridge.coverObjectToParams(params))
      .concat('&callbackId=' + callbackId)
  }

  /**
   * 请求授权
   *
   * @param callbackId 回调id
   * @returns {string} 处理过的URI
   * @memberof Bridge
   */
  public invokeAuthorizeWeb({ callbackId = '' }): string {
    return this.generateURI({
      routeName: 'eos/authorizeInWeb',
      params: {},
      callbackId
    })
  }

  /**
   *
   * 调用转账页面
   *
   * @param to 转账给谁
   * @param amount 转账金额
   * @param tokenName 代币符号
   * @param tokenContract 代币合约地址
   * @param tokenPrecision 代币精度
   * @param memo 转账备注
   * @param callbackId 回调id
   * @returns {string} 处理过的URI
   * @memberof Bridge
   */
  public invokeTransferPage({
    to = '',
    amount = 0,
    tokenName = 'EOS',
    tokenContract = 'eosio.token',
    tokenPrecision = 4,
    memo = '',
    callbackId = ''
  }): string {
    return this.generateURI({
      routeName: 'eos/transfer_page',
      params: {
        to,
        amount,
        tokenName,
        tokenContract,
        tokenPrecision,
        memo
      } as any,
      callbackId
    })
  }

  /**
   *
   * 发起转账请求
   *
   * @param to 转账给谁
   * @param amount 转账金额
   * @param tokenName 代币符号
   * @param tokenContract 代币合约地址
   * @param tokenPrecision 代币精度
   * @param memo 转账备注
   * @param orderInfo 订单信息
   * @param callbackId 回调id
   * @returns {string} 处理过的URI
   * @memberof Bridge
   */
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
      } as any,
      callbackId
    })
  }

  /**
   * 发起事务请求
   *
   * @param actions 事务Actions
   * @param options 事务Options
   * @param callbackId 回调id
   * @returns {string} 处理过的URI
   * @memberof Bridge
   */
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
      } as any,
      callbackId
    })
  }

  /**
   * 获取帐号信息
   *
   * @param callbackId 回调id
   * @returns {string}
   * @memberof Bridge
   */
  public invokeAccountInfo({ callbackId = '' }): string {
    return this.generateURI({
      routeName: 'eos/account_info',
      params: {},
      callbackId
    })
  }
}
