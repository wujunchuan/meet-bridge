/*
 * The Bridge Library for Meet.ONE Client
 * This library is used to assist in generating the protocol URI of the client, and encapsulates some common protocols and methods.
 * @Author: JohnTrump
 * @Date: 2018-08-06 16:26:02
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-09-28 21:12:14
 */

export default class Bridge {
  /**
   * The Version of Bridge Library
   * @type {string} The version of Bridge Library
   */
  static version: string = '2.0.0'

  static V2_MIN_VERSION = '2.0.0'

  /**
   * Designated protocol scheme, default `meetone://`
   * @type {string} protocol scheme
   */
  scheme: string

  /**
   * Try the `window.postMessage` failed times
   * @type {number}
   */
  tryTimes: number = 0

  /**
   * Creates an instance of Bridge.
   * @param {string} [protocol='meetone://']
   */
  constructor(scheme: string = 'meetone://') {
    this.scheme = scheme
    // auto add `message` EventListener
    window.document.addEventListener('message', e => {
      try {
        // @ts-ignore
        const { params, callbackId } = JSON.parse(e.data)
        const resultJSON = decodeURIComponent(atob(params))
        const result = JSON.parse(resultJSON)
        if (callbackId) {
          // @ts-ignore
          window[callbackId](result)
        }
      } catch (error) {}
    })
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
   * Generate random series callback ID
   * for realize the callback function
   * @private
   * @returns {string}
   */
  private _getCallbackId(): string {
    const random = parseInt(Math.random() * 10000 + '')
    return 'meet_callback_' + new Date().getTime() + random
  }

  /**
   * PostMessage to Client for invoke schema
   *
   * @private
   * @param {string} url
   * @memberof Bridge
   */
  private _sendRequest(url: string): void {
    try {
      console.log('post url', url)
      // @ts-ignore
      window.postMessage(url)
      this.tryTimes = 0
    } catch (error) {
      console.log('failed..', this.tryTimes)
      if (this.tryTimes < 5) {
        setTimeout(() => {
          this._sendRequest(url)
          this.tryTimes = ++this.tryTimes
        }, 100)
      }
    }
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
   * TODO: 客户端需要进一步支持Promise写法
   * Request authorization - Jump to the authorization page
   *
   * @param scheme - the callback of protocol scheme
   * @param redirectURL - When callback failed (eg.protocol doesn't response) will redirect to URL(common like dapps' homepage)
   * @param dappIcon - Dapps' icon URL
   * @param dappName - Dapps' name
   * @param loginMemo - Dapps' Authorization description
   * @returns {string | Promise} - The protocol of uri
   */
  public invokeAuthorize({
    scheme = null,
    redirectURL = null,
    dappIcon = null,
    dappName = null,
    loginMemo = null
  }): any {
    const callbackId = this._getCallbackId()
    const url = this.generateURI({
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
    if (Bridge.version >= Bridge.V2_MIN_VERSION) {
      this._sendRequest(url)
      return new Promise((resolve, reject) => {
        // @ts-ignore
        window[callbackId] = function(result) {
          try {
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }
      })
    } else {
      return url
    }
  }

  /**
   * Request authorization - return authorization information directly
   *
   * @returns {string | Promise} - The protocol of uri
   */
  public invokeAuthorizeInWeb(): any {
    const callbackId = this._getCallbackId()
    const url = this.generateURI({
      routeName: 'eos/authorizeInWeb',
      params: {},
      callbackId
    })
    if (Bridge.version >= Bridge.V2_MIN_VERSION) {
      this._sendRequest(url)
      return new Promise((resolve, reject) => {
        // @ts-ignore
        window[callbackId] = function(result) {
          try {
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }
      })
    } else {
      return url
    }
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
   * @returns {string | Promise} - 协议的URI地址
   */
  public invokeTransfer({
    to = '',
    amount = 0,
    tokenName = 'EOS',
    tokenContract = 'eosio.token',
    tokenPrecision = 4,
    memo = '',
    orderInfo = ''
  }): any {
    const callbackId = this._getCallbackId()
    const url = this.generateURI({
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
    if (Bridge.version >= Bridge.V2_MIN_VERSION) {
      this._sendRequest(url)
      return new Promise((resolve, reject) => {
        // @ts-ignore
        window[callbackId] = function(result) {
          try {
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }
      })
    } else {
      return url
    }
  }

  /**
   *
   * Send a transaction request
   *
   * ref: https://github.com/EOSIO/eosjs#transaction
   *
   * @param actions - transaction Actions
   * @param options - transaction Options
   * @param description - the description about transaction
   * @returns {string | Promise} - protocol uri
   */
  public invokeTransaction({ actions = [], options = { broadcast: true }, description = '' }): any {
    const callbackId = this._getCallbackId()
    const url = this.generateURI({
      routeName: 'eos/transaction',
      params: {
        actions,
        options,
        description
      } as any,
      callbackId
    })
    if (Bridge.version >= Bridge.V2_MIN_VERSION) {
      this._sendRequest(url)
      return new Promise((resolve, reject) => {
        // @ts-ignore
        window[callbackId] = function(result) {
          try {
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }
      })
    } else {
      return url
    }
  }

  /**
   * Get account information
   *
   * @returns {string | Promise} - protocol uri
   */
  public invokeAccountInfo({}): any {
    const callbackId = this._getCallbackId()
    const url = this.generateURI({
      routeName: 'eos/account_info',
      params: {},
      callbackId
    })
    if (Bridge.version >= Bridge.V2_MIN_VERSION) {
      this._sendRequest(url)
      return new Promise((resolve, reject) => {
        // @ts-ignore
        window[callbackId] = function(result) {
          try {
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }
      })
    } else {
      return url
    }
  }

  /**
   *
   * invoke application to Navigate
   *
   * @param target - Navigate to route name, eg 'EOSAuthorationPage'
   * @param options - Parameters that need to passed to the route component
   * @returns {string | Promise} - protocol uri
   */
  public invokeNavigate({ target = '', options = {} }): any {
    const callbackId = this._getCallbackId()
    const url = this.generateURI({
      routeName: 'app/navigate',
      params: {
        target,
        options
      } as any,
      callbackId
    })
    if (Bridge.version >= Bridge.V2_MIN_VERSION) {
      this._sendRequest(url)
      return new Promise((resolve, reject) => {
        // @ts-ignore
        window[callbackId] = function(result) {
          try {
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }
      })
    } else {
      return url
    }
  }

  /**
   *
   * invoke application to open a webview
   *
   * @param title - webview title
   * @param uri - target url which will be opened in webview
   * @returns {string | Promise} - protocol uri
   */
  public invokeWebview({ url = '', title = '' }): any {
    const callbackId = this._getCallbackId()
    const myUrl = this.generateURI({
      routeName: 'app/webview',
      params: {
        url,
        title
      } as any,
      callbackId
    })
    if (Bridge.version >= Bridge.V2_MIN_VERSION) {
      this._sendRequest(myUrl)
      return new Promise((resolve, reject) => {
        // @ts-ignore
        window[callbackId] = function(result) {
          try {
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }
      })
    } else {
      return myUrl
    }
  }

  /**
   * invoke clint to return signProvider for eos.js
   *
   * ref: https://github.com/EOSIO/eosjs/blob/master/src/index.test.js#L327
   *
   */
  public invokeSignProvider({ buf = [''], transaction = null }): any {
    const callbackId = this._getCallbackId()
    const url = this.generateURI({
      routeName: 'eos/sign_provider',
      params: {
        buf,
        transaction
      } as any,
      callbackId
    })
    if (Bridge.version >= Bridge.V2_MIN_VERSION) {
      this._sendRequest(url)
      return new Promise((resolve, reject) => {
        // @ts-ignore
        window[callbackId] = function(result) {
          try {
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }
      })
    } else {
      return url
    }
  }

  /**
   * invoke application to sign a signature which use current account and data
   *
   * @param {string} data - The data which used to create a signature
   * @param {string} whatfor - The description for the Sign request
   * @param {boolean} isHash - Is used `ecc.Signature.signHash` to sign
   * @param {boolean} isArbitrary - Is invoked by `scatter.getArbitrarySignature`, Default is `false`
   * @returns {string | Promise} - protocol uri
   */
  public invokeSignature({
    data = '', // 打算加密的内容
    whatfor = '', // 加密请求说明
    isHash = false,
    isArbitrary = false
  }): any {
    const callbackId = this._getCallbackId()
    const url = this.generateURI({
      routeName: 'eos/signature',
      params: {
        data,
        whatfor,
        isHash,
        isArbitrary
      } as any,
      callbackId
    })
    if (Bridge.version >= Bridge.V2_MIN_VERSION) {
      this._sendRequest(url)
      return new Promise((resolve, reject) => {
        // @ts-ignore
        window[callbackId] = function(result) {
          try {
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }
      })
    } else {
      return url
    }
  }

  /**
   * invoke application to get token Balance
   *
   * @param {string} accountName - the account name of want to query balance - options
   * @param {string} contract - the token publisher smart contract name - default is 'eosio.token'
   * @param {string} symbol - the token symbol - default is 'EOS'
   * @returns {string} - protocol uri
   */
  public invokeBalance({ accountName = '', contract = 'eosio.token', symbol = 'EOS' }): any {
    const callbackId = this._getCallbackId()
    const url = this.generateURI({
      routeName: 'eos/getBalance',
      params: {
        accountName,
        contract,
        symbol
      } as any,
      callbackId
    })
    if (Bridge.version >= Bridge.V2_MIN_VERSION) {
      this._sendRequest(url)
      return new Promise((resolve, reject) => {
        // @ts-ignore
        window[callbackId] = function(result) {
          try {
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }
      })
    } else {
      return url
    }
  }
}
