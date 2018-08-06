/*
 * MEET桥接
 * @Author: JohnTrump
 * @Date: 2018-08-06 16:26:02
 * @Last Modified by:   JohnTrump
 * @Last Modified time: 2018-08-06 16:26:02
 */

export default class Bridge {
  schema: string

  constructor(schema: string = 'meetone://') {
    this.schema = schema
  }

  // 将对象转换成URL参数并且完成转码
  // 编码过程： JSON化 -> url编码 -> base64编码
  private _coverObjectToParams(obj: object): string {
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
  private _revertParamsToObject(url: string): object {
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

  // 生成URI地址
  public generateURI({ routeName = 'eos/transfer', params = {} }): string {
    return this.schema
      .concat(routeName)
      .concat('?params=')
      .concat(this._coverObjectToParams(params))
      .concat('&callbackId=' + '101')
  }

  // getInfo(callback: any) {
  //   this.eos.getInfo({}).then((res: any) => {
  //     callback && callback(res)
  //   })
  // }

  // getAccount(accountName: string, callback: any) {
  //   this.eos.getAccount({ account_name: accountName }).then((res: any) => {
  //     callback && callback(null, res)
  //   })
  // }
}
