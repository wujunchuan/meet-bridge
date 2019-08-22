/*
 * The Bridge Library for Meet.ONE Client
 * This library is used to assist in generating the protocol URI of the client, and encapsulates some common protocols and methods.
 * @Author: JohnTrump
 * @Date: 2018-08-06 16:26:02
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-08-22 17:34:21
 */

export default class Bridge {
  static V2_MIN_VERSION = '2.0.0'

  /**
   * Designated protocol scheme, default `meetone://`
   * @type {string}
   */
  scheme: string

  /**
   * The Version of Bridge Library
   * @type {string}
   */
  version: string

  /**
   * Try the `window.postMessage` failed times
   *
   * Over 60 times will throw error ('post url timeout')
   *
   * @type {number}
   */
  tryTimes: number = 0

  /**
   * Creates an instance of Bridge.
   *
   * @param {string} [protocol='meetone://']
   * @param {string} The version of Bridge Library
   */
  constructor(scheme: string = 'meetone://', version = '2.1.0') {
    this.scheme = scheme
    this.version = version
    // 判断`addMessageHandleFlag`是否为1[避免重复监听相同事件]
    if (window.document.body.getAttribute('addMessageHandleFlag') !== '1') {
      window.document.body.setAttribute('addMessageHandleFlag', '1')
      // auto add `message` EventListener
      window.document.addEventListener('message', e => {
        try {
          // @ts-ignore
          const { params, callbackId } = JSON.parse(e.data)
          const resultJSON = decodeURIComponent(atob(params))
          const result = JSON.parse(resultJSON)
          // Will skip new Library ('meet-js-sdk') callback
          // Notice that, we will skip the callback startwith `meetjs_callback`
          // So don't use it if you manually define callbackid
          if (callbackId.startsWith('meetjs_callback')) {
            return
          }
          // @ts-ignore
          if (callbackId && typeof window[callbackId] === 'function') {
            // @ts-ignore
            window[callbackId](result)
          }
        } catch (error) {}
      })
    }
  }

  /**
   * Parse Javascript Object to params String
   *
   * Detailed conversion process:
   *
   * JSON.stringify() -> encodeURIComponent() -> btoa()
   *
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
   *
   * For realize the callback function
   *
   * @private
   * @returns {string} - `meet_callback_[id]`
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
   */
  private _sendRequest(url: string): void {
    try {
      // console.log('post url', url)
      // @ts-ignore
      window.postMessage(url)
      this.tryTimes = 0
    } catch (error) {
      // console.log('failed..', this.tryTimes)
      // 每1s尝试重新发起，失败次数60次之后不再发起
      if (this.tryTimes < 60) {
        setTimeout(() => {
          this._sendRequest(url)
          this.tryTimes = ++this.tryTimes
        }, 1000)
      } else {
        console.error('post url timeout(60 times):', url)
      }
    }
  }

  /**
   * Generate Promise with callbackId
   * Callback is once!
   *
   * If `bridge.version < 2.0.0` will return String
   *
   * @param {Object} obj
   *  - {
   *    routeName: String,
   *    params: Object
   * }
   * @returns {Promise | String}
   */
  public customGenerate(obj: Object): any {
    const callbackId = this._getCallbackId()
    obj = Object.assign(obj, { callbackId })
    const url = this.generateURI(obj)
    if (this.version >= Bridge.V2_MIN_VERSION) {
      this._sendRequest(url)
      return new Promise((resolve, reject) => {
        // @ts-ignore
        window[callbackId] = function(result) {
          try {
            resolve(result)
          } catch (error) {
            reject(error)
          } finally {
            // @ts-ignore
            window[callbackId] = null
          }
        }
      })
    } else {
      return url
    }
  }

  /**
   *
   * @author JohnTrump
   * @param {Object} obj  - target Javascript Object
   * @param {string} callbackId - make sure callbackId unique
   * @param {(result: object) => void} callback - callback function
   * @returns {*}
   * @memberof Bridge
   */
  public timesGenerate(obj: Object, callbackId: string, callback: () => void): any {
    obj = Object.assign(obj, { callbackId })
    const url = this.generateURI(obj)
    this._sendRequest(url)
    // @ts-ignore
    window[callbackId] = callback
    return url
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
    let targetURL = ''
    targetURL = this.scheme
      .concat(routeName)
      .concat('?params=')
      .concat(Bridge.coverObjectToParams(params))
    // 如果有指定回调
    if (callbackId) {
      targetURL = targetURL.concat('&callbackId=' + callbackId)
    }
    return targetURL
  }

  /**
   * Get EOS wallet current network
   * include chain_id and domians[]
   */
  public invokeGetNetwork(): any {
    return this.customGenerate({
      routeName: 'eos/network'
    })
  }

  /**
   * 触发客户端分享
   *
   * @param shareType - 分享类型: `1 文本；2 图片；3 web link；4 文件; 5 口令`
   * @param imgUrl - 分享的图片[可选]
   * @param title - 分享标题
   * @param description - 分享内容
   * @param options - 附带的参数（`shareType = 5`时需要）
   */
  public invokeShare({
    shareType = 1,
    title = '',
    description = '',
    imgUrl = '',
    options = {}
  }): any {
    return this.customGenerate({
      routeName: 'app/share',
      params: {
        shareType,
        imgUrl,
        title,
        description,
        options
      }
    })
  }

  /**
   * 生成分享口令
   *
   * 生成的口令会自动被复制，打卡App后会弹出分享的内容
   *
   * @param description - 口令分享弹窗描述
   * @param name - Dapps的名称
   * @param target - 口令分享跳转的url
   * @param banner - 弹窗的banner图片
   * @param icon - 弹窗Dapp图标
   */
  public invokeShareCode({
    description = '',
    name = '',
    target = '',
    banner = '',
    icon = ''
  }): any {
    return this.customGenerate({
      routeName: 'app/share',
      params: {
        shareType: 5,
        description,
        options: {
          name,
          target,
          banner,
          icon
        }
      }
    })
  }

  /**
   * Request authorization - return authorization information directly
   */
  public invokeAuthorizeInWeb(): any {
    return this.customGenerate({
      routeName: 'eos/authorizeInWeb'
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
    return this.customGenerate({
      routeName: 'eos/transfer',
      params: {
        to,
        amount,
        tokenName,
        tokenContract,
        tokenPrecision,
        memo,
        orderInfo
      }
    })
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
   */
  public invokeTransaction({ actions = [], options = { broadcast: true }, description = '' }): any {
    return this.customGenerate({
      routeName: 'eos/transaction',
      params: {
        actions,
        options,
        description
      }
    })
  }

  /**
   * Get account information
   */
  public invokeAccountInfo(): any {
    return this.customGenerate({
      routeName: 'eos/account_info'
    })
  }

  /**
   *
   * invoke application to Navigate
   *
   * @param target - Navigate to route name, eg 'EOSAuthorationPage'
   * @param options - Parameters that need to passed to the route component
   */
  public invokeNavigate({ target = '', options = {} }): any {
    return this.customGenerate({
      routeName: 'app/navigate',
      params: {
        target,
        options
      }
    })
  }

  /**
   *
   * invoke application to open a webview
   *
   * @param title - webview title
   * @param uri - target url which will be opened in webview
   */
  public invokeWebview({ url = '', title = '' }): any {
    return this.customGenerate({
      routeName: 'app/webview',
      params: {
        url,
        title
      }
    })
  }

  /**
   *
   * custom menu of webview
   * @author JohnTrump
   */
  public webviewRightMenu({ title = '', callback = () => {} }): any {
    // @ts-ignore
    window['meet_callback_webview_right_menu'] = null
    return this.timesGenerate(
      {
        routeName: 'app/webview/right_menu',
        params: {
          right: title
        }
      },
      'meet_callback_webview_right_menu',
      callback
    )
  }

  /**
   * invoke clint to return signProvider for eos.js
   *
   * ref: https://github.com/EOSIO/eosjs/blob/master/src/index.test.js#L327
   *
   */
  public invokeSignProvider({ buf = [''], transaction = null }): any {
    return this.customGenerate({
      routeName: 'eos/sign_provider',
      params: {
        buf,
        transaction
      }
    })
  }

  /**
   * invoke application to sign a signature which use current account and data
   *
   * @param {string} data - The data which used to create a signature
   * @param {string} whatfor - The description for the Sign request
   * @param {boolean} isHash - Is used `ecc.Signature.signHash` to sign
   * @param {boolean} isArbitrary - Is invoked by `scatter.getArbitrarySignature`, Default is `false`
   */
  public invokeSignature({
    data = '', // 打算加密的内容
    whatfor = '', // 加密请求说明
    isHash = false,
    isArbitrary = false
  }): any {
    return this.customGenerate({
      routeName: 'eos/signature',
      params: {
        data,
        whatfor,
        isHash,
        isArbitrary
      }
    })
  }

  /**
   * invoke application to get token Balance
   *
   * @param {string} accountName - the account name of want to query balance - options
   * @param {string} contract - the token publisher smart contract name - default is 'eosio.token'
   * @param {string} symbol - the token symbol - default is 'EOS'
   */
  public invokeBalance({ accountName = '', contract = 'eosio.token', symbol = 'EOS' }): any {
    return this.customGenerate({
      routeName: 'eos/getBalance',
      params: {
        accountName,
        contract,
        symbol
      }
    })
  }
}
