https://developers.weixin.qq.com/minigame/dev/api/

```ts
const Test: ApiNameSpace = {
    name: 'wx',
    id: '1',
    type: ApiType.Namespace,
    comment: '微信模块',
    props: {
        getUpdateManager: {
            name: 'getUpdateManager',
            params: [],
            return: {
                name: 'return',
                comment: 'xxxx',
                type: ApiType.Obj,
                ref: '2',
            },
        } as ApiFun,
    },
};

const UpdateManager = {
    id: '2',
};
```
