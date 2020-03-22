import { ApiBase, ApiNameSpace, ApiType } from 'api';
import { saveToFile } from 'utils/utils';
import { genNamespace, genType } from './writeApiUtils';

export async function writeApiIn(api: ApiBase) {
    let str: string;
    if (api.type === ApiType.Namespace) {
        str = genNamespace(api as ApiNameSpace);
        addWriteStr(str);
    } else if (api.type === ApiType.Obj) {
        genType('', api);
    }
}

/** 添加额外的 */
export let api_str = '';
export function addWriteStr(str: string, append = false) {
    if (append) {
        api_str = api_str + '\n' + str;
    } else {
        api_str = str + '\n' + api_str;
    }
}

export function writeApiEnd() {
    return saveToFile('wx.d.ts', api_str);
}
