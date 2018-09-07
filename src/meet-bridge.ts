/*
 * The Bridge Library for Meet.ONE Client
 * This library is used to assist in generating the protocol URI of the client, and encapsulates some common protocols and methods.
 * @Author: JohnTrump
 * @Date: 2018-08-06 16:26:02
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-08-07 19:46:44
 */

export default class Bridge {
  /**
   * Designated protocol scheme, default `meetone://`
   * @type {string} protocol scheme
   */
  scheme: string

  /**
   * Creates an instance of Bridge.
   * @param {string} [protocol='meetone://']
   */
  constructor(scheme: string = 'meetone://') {
    this.scheme = scheme
  }

  /**
   * Parse Javascript Object to params String
   * Detailed conversion process: JSON.stringify() -> encodeURIComponent() -> btoa()
   * @static
   * @param {object} obj - target Javascript Object
   * @returns {string} - params String
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
   * Parse params String to Javascript Object
   *
   * Detailed conversion process: atob() -> decodeURIComponent() -> JSON.parse()
   * @static
   * @param {string} url - params String
   * @returns {object} - Javascript Object
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
   * Parse URL String to Object
   * @static
   * @param {string} url - URL
   * @returns {object} - URL Object
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
   * Generate the protocol URI
   *
   * The web side can communicate with the client through the following two calling methods.
   *
   * 1. window.location.href = uri (outside web calling - out of application client)
   *
   * 2. window.postMessage(uri) (inside Webview calling - in application client)
   *
   * @param routeName - the path for protocol uri, eg: 'eos/authorize'
   * @param params - the query of params
   * @param callbackId - callback id
   * @returns {string} - The protocol of uri
   */
  public generateURI({ routeName = '', params = {}, callbackId = '' }): string {
    return this.scheme
      .concat(routeName)
      .concat('?params=')
      .concat(Bridge.coverObjectToParams(params))
      .concat('&callbackId=' + callbackId)
  }

  /**
   * Request authorization - Jump to the authorization page
   *
   * @param scheme - the callback of protocol scheme
   * @param redirectURL - When callback failed (eg.protocol doesn't response) will redirect to URL(common like dapps' homepage)
   * @param dappIcon - Dapps' icon URL
   * @param dappName - Dapps' name
   * @param loginMemo - Dapps' Authorization description
   * @param callbackId - callback id
   * @returns {string} - The protocol of uri
   */
  public invokeAuthorize({
    scheme = null,
    redirectURL = null,
    dappIcon = null,
    dappName = null,
    loginMemo = null,
    callbackId = ''
  }): string {
    return this.generateURI({
      routeName: 'eos/authorize',
      params: {
        dappIcon,
        dappName,
        loginMemo,
        scheme,
        redirectURL
      } as any,
      callbackId
    })
  }

  /**
   * Request authorization - return authorization information directly
   *
   * @param callbackId - callback id
   * @returns {string} - The protocol of uri
   */
  public invokeAuthorizeInWeb({ callbackId = '' }): string {
    return this.generateURI({
      routeName: 'eos/authorizeInWeb',
      params: {},
      callbackId
    })
  }

  /**
   *
   * Open The Transfer Page
   *
   * @param to 转账给谁
   * @param amount 转账金额
   * @param tokenName 代币符号
   * @param tokenContract 代币合约地址
   * @param tokenPrecision 代币精度
   * @param memo 转账备注
   * @param callbackId 回调id (选填)
   * @returns {string} - 协议的URI地址
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
   * Send a transfer request
   *
   * @param to 转账给谁
   * @param amount 转账金额
   * @param tokenName 代币符号
   * @param tokenContract 代币合约地址
   * @param tokenPrecision 代币精度
   * @param memo 转账备注
   * @param orderInfo 订单信息
   * @param callbackId 回调id (选填)
   * @returns {string} - 协议的URI地址
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
   *
   * Send a transaction request
   *
   * ref: https://github.com/EOSIO/eosjs#transaction
   *
   * @param actions transaction Actions
   * @param options transaction Options
   * @param callbackId callbackid
   * @returns {string} - protocol uri
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
   * Get account information
   *
   * @param callbackId callbackid
   * @returns {string} - protocol uri
   */
  public invokeAccountInfo({ callbackId = '' }): string {
    return this.generateURI({
      routeName: 'eos/account_info',
      params: {},
      callbackId
    })
  }

  /**
   *
   * invoke application to Navigate
   *
   * @param target - Navigate to route name, eg 'EOSAuthorationPage'
   * @param options - Parameters that need to passed to the route component
   * @param callbackId callback id
   * @returns {string} - protocol uri
   */
  public invokeNavigate({ callbackId = '', target = '', options = {} }): string {
    return this.generateURI({
      routeName: 'app/navigate',
      params: {
        target,
        options
      } as any,
      callbackId
    })
  }

  /**
   *
   * invoke application to open a webview
   *
   * @param title - webview title
   * @param uri - target url which will be opened in webview
   * @param callbackId - callback id
   * @returns {string} - protocol uri
   */
  public invokeWebview({ callbackId = '', url = '', title = '' }): string {
    return this.generateURI({
      routeName: 'app/webview',
      params: {
        url,
        title
      } as any,
      callbackId
    })
  }

  /**
   * invoke application to sign a signature which use current account and data
   *
   * @param {string} data - The data which used to create a signature
   * @param {string} callbackId - callback id
   * @returns {string} - string signature
   */
  public invokeSignature({ callbackId = '', data = '' }): string {
    return this.generateURI({
      routeName: 'eos/signature',
      params: {
        data
      } as any,
      callbackId
    })
  }
}
