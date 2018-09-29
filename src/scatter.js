/*
 *
 * 关于客户端实现Scatter兼容的代码注入
 * minify & babel online at https://babeljs.io/repl#?babili=true&browsers=&build=&builtIns=false&spec=false&loose=false&code_lz=AQ4NwQwJ2BnBjCAXJBTGBeYBvAUKUAekOAEsAzORFdAOlNgEkA7AK1XiWC3IgBtYqYAHsYAIyHMArnz4AaYAHdSs4MjQBbAA5ckwsmw5cIAcwilm-AmSaHOALmBIoU1HKsFSAE1TMkpJABPR2lZd2tgKFQARylSKIA1dFhSYWZHAHIM8OstKTE-UngAawBpVGDgLJyCZlQkRVFixzwIkHIZPgALYVgkRw7mTlTmAAoAShwPNqikKShmJy6GWi0oYT14YT5gAGoq-2IMvaWVnr6TjPtj_aRl2FXRJGmCAF8X4Fea0D6oUi0tKgvAAJXr9YCDYZpCZTNrAPj1YCoDB8YTUEa0c5IZgQDSoADcHxAs3miwADBhKah6MwfAAPADy5FGACJFOzaCzxgAybmjZHUqJaPgQeCoVnsxScuQsrnjOSoD5fD4pEzMAAK6zA3nQAykQ380NVOKgJlgk1abWIwC6KC0sEOhBMAS6-VoWw0hAA4vUAMrUNBQQj-9ToADqqDEAFE6WhmCk0oQCsIxIQAJxeMnkMlpgAsADZyAAOcgAVgAzORUKX8_A0xBSwAmCDkCRiUul-DwADsjfguYAjMXULnCLAoPBCMKpM744QfLwZEhYIRUL1aKxYABiAAyA_z3aJwGtABUGQARBmOQAA6YBAyMAMdqABCMjySFsAxH8vCZqRYwMJiqgvqkGqmrCNqPhQKMlpwmIUjkI4ACCUBQBAgS0OQ6waKMxrQGatCweQ8pHiAzgQPGoqGukcDASaeGkeRUKWHCrzjLQdy-KMkKUaMUTmrCcLHiQgBF2oA7EaAPdegAhboAedqAA3OgApeoAp9GAPRmgBDyoAwAGAJvxgCd8YAYXLEYJNp2g6xDOncboeoQUYMr6jAMquvSbkmqKphoEB9OgY4ToQFj0mxqB9Bu247uWjaHgJZCUDx_nusIPjcJSwBkhauAAJBpa-iy8bQXjIBAtA4XMUSEuF7zhRlVQZMVbQse6yDwF0nH6ox_LIclZX1KSSLIVVEQsT1oDKhE35IIwPh-AElRcSMMLQdY5Uft4340n-AEIV2wj6iNzDkMIExsV0HFRXxGAAHz8XCFDAEdMVxZSWBJedAmQDACChlAo2-P4QTcI94Wilsm0OsAADas3hSAEBSHcogTY4LIUaQYCoCy3zg--qIlPV5hUSya6wCj-kRDieKOFlOVIHl_0bX4hMDQAuqjAl5AURTlJUZO5as-SFPAbO06V4N3CsOrjd9WCvTQ71jV9gT9XC5US4GH2i7L-kC_LHVvtg6vWCxSqM5D7HjdQqB6gaIxqFDB3G8g4ptW0l2jAAhELDwizL9vhaBGgMIKqDsJwowZKEfAZOMcszJrzARyA7xHgiXBaNAuKwD9YNtBhwgaI4rv0NLE20FTgPA2SdO0MTbi08zPNszn9x559BfV6zFSMxExrkxAdcrL8_yAiCYITEecca4ViwLV-P7MCtgE0cg8ziunBCd44ScoRoDwd7lw-sUbjXm9CvGew7kVZVst0JQ9S9zVHkTRZ3-Vz4VBJq_p5VZDHnysdQ9X7816BQGPhEcqADP59X1h8Happ6jKxlmbRiV0gGgFzu7CaP0Q6f3Kt7X2tBeLbCRhMCOg0b6xHiKgJIUAExUSmmkO-pDEjJGmgAfSRpQkYSCSL1yiPQoEFCqE_RYYwtIRD3AfGGkhMQAQUJQECEBNU88ojwMosAcRUBJGkRkXInEz9RjN15q3YAncFCKC6MgKBCgGDAjcl0DhShTFICgT9ExZjRDAAAD5uIqp_Sx1ifo-NgF0dxnjeACBfnCU8F4rzAEAFg6gAqcyfIAMCVACjEUea06lABY_4ZJA9pHSmVdGIGKnofRIBDJLYMAZwyRhjHGKhTkUzpkzNmPMhYSwVirDWOsDZmytkjB2LsvZ-xDiLCOTyk5pyzhXAuSGfBlz2QeJuXcA5Gz5hfLfCeS1fz_lnvInR18QDWj0bXYAhzW76RXoY3KbdQDOIcaIRwNzzH6X8V0RwzyrkgAYBIqR0BKjOFcDvfaHEaGLCOrYj5p9ornyEHdRKYLQDlQ5hTR-OyF6f1jm_W-2DBC4P9kYUFYDxgQI-FIQQsDYYQiasoklqAyVBFGKgoItiUH5zFmQFlqs4S5xOYEH6zLG7fQAPynDduyrmLN9E8syJVIl7cZzfj6AAOXqI0KAzQKUH0WLAOV_kkBKoaE0UYdR9WqtsVgzCOC8F8AIX81A4cZXWDxkoi2hrlVNAUFGXoCg8YMh0CMVOWBtYKDWBsNE2wmX1yNSq4oP0GRiADkgQusBjSjFzpGt1wA00mu8ZFJ2mbiirHWJsMNv02h5oLSGrYOwsDBqLTsDxVRbTZOlcxI8z0slaCjLSLQwgLBcCwGWmtoadj7CuEcE4ZasSXGuOO11qrHhQCQJ_NtWMLCjXQbO_NK7mCjUwbfD1sBRixvjYm5N3rfVpFgAoPZ7bO1eG7b2xwjaO1dp7X4d5wAt2jUcJ-rw77jSgXArqYVyKNRah1FAHedreq4GmK8IAA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=es2015%2Creact%2Cstage-2%2Cbabili&prettier=false&targets=&version=6.26.0&envVersion=
 *
 * @Author: JohnTrump
 * @Date: 2018-09-29 09:34:55
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2018-09-29 09:35:56
 */

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
  strippedHost: function () {
    let e = location.hostname;
    return 0 === e.indexOf("www.") && (e = e.replace("www.", "")), e
  },
  signProvider: function (signargs) {
    // https://github.com/GetScatter/ScatterWebExtension/blob/9d0f0946f8f53fe56c9a52afbeb55cc72c41f8e4/src/plugins/defaults/eos.js#L167
    // TODO: 需要完成
    return bridge.invokeSignProvider({
      buf: Array.from(signargs.buf),
      transaction: signargs.transaction
    }).then(function (res) {
      // 客户端的实现应该是参考这边了
      // https://github.com/EOSIO/eosjs/blob/master/src/index.test.js#L327
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
    if (!this.identity) {
      Promise.reject('null');
      return;
    }

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
    // TODO: 尚未完成分装
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
    this.publicKey = this.identity ? this.identity.publicKey : '';
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
