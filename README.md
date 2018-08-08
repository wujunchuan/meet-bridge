# MEET客户端桥接库

## 介绍

本库用于辅助生成客户端的协议URI,封装了一些常见的协议与方法

## 使用方法

1. web -> 客户端

    生成协议URI地址后，Web端可以通过下面两种调用方式与客户端进行通讯

    - `window.location.href = uri` 外部Web调用

    - `window.postMessage(uri)` 内部webview调用

2. 客户端 -> web

    接收与解析客户端返回的东西，可以通过监听`Message`事件来实现

    - 原生js代码如下
      ```js
      window.document.addEventListener('message', function(e) {
        const message = e.data;
        // 接收到的原始数据
        document.getElementById('receive').innerHTML = messgae;
        const {params} = JSON.parse(message);
        // 解码后的数据
        // 可以使用 `Bridge.revertParamsToObject(params)` 直接转换成Object对象;
        document.getElementById('decode').innerHTML = decodeURIComponent(atob(params));
      });
      ```