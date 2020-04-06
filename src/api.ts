/** 所有的类型存储在的地方 */
export interface ApiMap {
    [key: string]: ApiBase;
}

/** 所有的api的type */
export enum ApiType {
    Str = 'string',
    Bool = 'boolean',
    Undefined = 'undefined',
    Null = 'null',
    Num = 'number',
    Obj = 'object',
    Fun = 'function',
    Namespace = 'namespace',
}

export type RefApi = string;
/** 所有的api基本类型包含的属性 */
export interface ApiBase {
    name: string;
    comment: string;
    type: ApiType;
    full_name?: string;
    ref_name?: string;
    ref?: RefApi;
}

export interface ApiFun extends ApiBase {
    id: string;
    params?: ApiBase[];
    return_type?: ApiBase | ApiBase[];
    type: ApiType.Fun;
}

export interface ApiObj extends ApiBase {
    id: string;
    type: ApiType.Obj;
    props: {
        [key: string]: ApiBase;
    };
}
export interface ApiNameSpace extends ApiBase {
    id: string;
    type: ApiType.Namespace;
    props: {
        [key: string]: ApiBase;
    };
}

export interface ApiNameSpace extends ApiBase {
    id: string;
    type: ApiType.Namespace;
    props: {
        [key: string]: ApiBase;
    };
}

export function isPrime(type: ApiType) {
    if (
        type === ApiType.Fun ||
        type === ApiType.Obj ||
        type === ApiType.Namespace
    ) {
        return false;
    }
    return true;
}
