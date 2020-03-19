/** 所有的类型存储在的地方 */
interface ApiMap {
    [key: string]: ApiBase;
}

/** 所有的api的type */
enum ApiType {
    Str = 'string',
    Bool = 'boolean',
    Undefined = 'undefined',
    Null = 'null',
    Num = 'number',
    Obj = 'object',
    Fun = 'function',
    Namespace = 'namespace',
}

type RefApi = string;
/** 所有的api基本类型包含的属性 */
interface ApiBase {
    name: string;
    comment: string;
    type: ApiType;
    ref?: RefApi;
}

interface ApiFun extends ApiBase {
    id: string;
    params: ApiBase[];
    return: ApiBase | ApiBase[];
    type: ApiType.Fun;
}

interface ApiObj extends ApiBase {
    id: string;
    type: ApiType.Obj;
    props: {
        [key: string]: ApiBase;
    };
}

interface ApiNameSpace extends ApiBase {
    id: string;
    type: ApiType.Namespace;
    props: {
        [key: string]: ApiBase;
    };
}

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
