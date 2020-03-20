-   @todo onShow 两层参数 怎么处理

-   @bug 手机上无法接收再来一局 电脑可以

    -   可能是哪里出了问题
    -   有一个时候出现了两个邀请再来一局的弹框（可能和这有关...）

## 2020-03-19 13:42:24

-   @ques 有没有可能一层一层的去便利..

-   @todo 先做一个简单的 wx.getUpdateManager

-   @ques 如何将其他的关闭

-   @bug

    -   onUpdateReady res
    -   addService:>Array.<Object>

-   @err 有问题的

```
Touch
RenderingContext
Image
wx.navigateToMiniProgram
wx.getUserInfo
UserInfo
FriendInfo
KVData
UserGameData
AuthSetting
SubscriptionsSetting
IBeaconInfo
```

-   @opt parseHtml 的逻辑还需要优化

-   @ques findNextSubObj 如果返回的是简单类型会怎样

-   @ques 函数找不到 他的类型 就变成 FuncVoid

-   @ques 将问题变得具体

    -   寻找返回 一个 函数 对象 -> 如果能够通用就好了

-   次级的属性 h2 h3 h4 h5 能够规律表示吗

-   @ques 感觉这所有的一切裹在一起很难处理了

-   @ques 返回值如果是基本类型 我怎么处理

    -   这显然 参数 | 返回值都有这种 情况

-   @ques parse 出来的对象 和 api 中的 怎么匹配...

-   标题解析

    -   Object wx.getSystemInfoSync() -> wx> getSystemInfoSync
    -   Object res :> res
    -   res.safeArea 的结构:> safeArea
    -   可以将 字符 split 然后一级一级的筛选。。。

-   @ques 怎么找出 res.safeArea 的值...

    -   可以一级一级的找

*   @ques 跨越多个页面 `$` 如何区分

    -   是一个页面一个页面的访问的
    -   parsePage 只要保存一个页面就可以了
    -   @ques 会不会出现多层页面

*   @ques 怎么判断 wx 和非 wx

*   @ques 可以将匹配的格式 做成几个类型 一个个的去 match...

-   @ques 如何像 wx 文档组织起来

    -   #docContent>h3|h4 + .table-wrp
        -   table>tbody>tr>td+td
        -   td+td+td+td
        -
    -   #docContent>h1+p>h3+p

*   @ques optional 如何处理

*   @ques 没有名称 类型如何处理， 直接构建一个名称 方法+param_name|return

-   @ques 跨页面的类型如何处理??

*   @ques 解析类型 '返回值' | '参数'

*   @ques 如果没有 table-wrp 怎么处理。

*   @ques subPage 存不存在函数 有多个参数...

*   @ques 函数的信息可以从二级目录获取

*   @ques 怎么判断二级目录是函数还是属性

    -   函数格式:> 参数 + 返回值

*   @note 二级页面的类型

    -   对象:> https://developers.weixin.qq.com/minigame/dev/api/base/app/touch-event/Touch.html
    -   函数 直接返回:> https://developers.weixin.qq.com/minigame/dev/api/base/system/system-info/wx.getSystemInfoSync.html
    -   函数 callback:> https://developers.weixin.qq.com/minigame/dev/api/base/system/system-info/wx.getSystemInfoSync.html

*   @todo pc 小游戏 怎么处理...

### finish

-   @ques 怎么选中 h3 或者 h4

-   如何选中 .table-wrp 前一个 h3|h4
