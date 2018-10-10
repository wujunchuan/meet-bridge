/*
 * 关于客户端实现Scatter兼容的代码注入
 * minify & babel online at https://babeljs.io/repl#?babili=true&browsers=&build=&builtIns=false&spec=false&loose=false&code_lz=Q&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=es2015%2Creact%2Cstage-2%2Cbabili&prettier=false&targets=&version=6.26.0&envVersion=
 *
 * @Author: JohnTrump
 * @Date: 2018-09-29 09:34:55
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-09-30 18:09:10
 */


var bridge = null;

var scatter = {
  // if scatter.isInject = false or be null, will attempt to inject again
  isInject: true,
  identity: null,
  requireVersion: '',
  publickKey: '',
  network: {
    fullhost: function () {
      return this.protocol + '://' + this.host + ':' + this.port
    }
  },
  connect: function connect() {
    return Promise.resolve(true);
  },
  strippedHost: function () {
    let e = location.hostname;
    return 0 === e.indexOf("www.") && (e = e.replace("www.", "")), e
  },
  signProvider: function (signargs) {
    // https://github.com/GetScatter/ScatterWebExtension/blob/9d0f0946f8f53fe56c9a52afbeb55cc72c41f8e4/src/plugins/defaults/eos.js#L167
    return bridge.invokeSignProvider({
      buf: Array.from(signargs.buf),
      transaction: signargs.transaction.actions
    }).then(function (res) {
      // 客户端的实现参考: https://github.com/EOSIO/eosjs/blob/master/src/index.test.js#L327
      if (res.code === 0) {
        return res.data.signature;
      }
      return '';
    }).catch(function (err) {
      return err;
    });
  },
  getIdentity: function () {
    return bridge.invokeAccountInfo().then((res) => {
      if (res.code === 0) {
        var scatterIdentity = {
          accounts: [{
            authority: "active",
            blockchain: "eos",
            name: res.data.account
          }],
          publicKey: res.data.publicKey
        }
        this.identity = scatterIdentity;
        return scatterIdentity;
      }
      return {}
    })
  },
  authenticate: function authenticate() {
    let params = {
      from: this.identity.accounts[0].name,
      publicKey: this.identity.publicKey,
      signdata: this.strippedHost()
    }
    return bridge.invokeSignature({
      data: params.signdata
    }).then(function (res) {
      if (res.code === 0) {
        return res.data.signature;
      }
      return '';
    }).catch(function (err) {
      return err;
    });
  },
  forgetIdentity: function () {
    this.identity = null;
    return Promise.resolve();
  },
  requireVersion: function requireVersion(_version) {
    this.requiredVersion = _version;
  },

  getArbitrarySignature: function getArbitrarySignature(publicKey, data, whatfor, isHash) {
    whatfor = whatfor || '';
    isHash = isHash || false;
    // 参考： https://github.com/GetScatter/ScatterWebExtension/blob/9d0f0946f8f53fe56c9a52afbeb55cc72c41f8e4/src/plugins/defaults/eos.js#L126
    return bridge.invokeSignature({
      // publicKey: publicKey,
      data: data,
      whatfor: whatfor,
      isHash: isHash,
      isArbitrary: true
    }).then(function (res) {
      if (res.code === 0) {
        return res.data.signature;
      }
      return Promise.reject(res);
    })
  },

  useIdentity: function useIdentity(identity) {
    this.identity = identity;
    this.publicKey = this.identity ? this.identity && this.identity.publicKey : '';
  },

  suggestNetwork: function suggestNetwork(network) {
    return Promise.resolve(true);
  },

  eos: function (network, Eos, eosOptions = {}, protocol) {
    this.network = Object.assign(this.network, network);
    if (!network.protocol) {
      network.protocol = protocol || 'http';
    }
    var httpEndpoint = network.protocol + '://' + network.host + ':' + network.port;
    var chainId = network.chainId;
    return Eos(Object.assign(eosOptions, {
      httpEndpoint: httpEndpoint,
      chainId: chainId,
      signProvider: this.signProvider
    }));
  }

}

bridge = new MeetBridge();

// Event Emit scatterLoaded
document.dispatchEvent(new CustomEvent('scatterLoaded'), {});

console.log('init bridge', bridge, scatter);
