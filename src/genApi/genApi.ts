import { ApiBase, ApiMap, ApiNameSpace, ApiObj, ApiType } from 'api';
import { genId, saveToFile } from 'utils/utils';
import { genNamespace, genType } from './genApiUtils';
import { stringify } from 'utils/stringify';

const api_map: ApiMap = {};

export async function genApi(item_api: ApiBase) {
    const { full_name, name } = item_api;

    /** @test */
    await saveToFile(`${name}.json`, stringify(item_api, 10));

    const parent_api = detectParentType(full_name);
    if (!parent_api) {
        return;
    }
    parent_api.props[name] = item_api;

    let str: string;
    if (parent_api.type === ApiType.Namespace) {
        str = genNamespace(parent_api as ApiNameSpace);
        addWriteStr(str, true);
    } else if (parent_api.type === ApiType.Obj) {
        genType('', parent_api);
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

export function writeApi() {
    return saveToFile('wx.d.ts', api_str);
}

function detectParentType(full_name: string) {
    const name_arr = full_name.split('.');
    if (name_arr.length !== 2) {
        return;
    }
    const name = name_arr[0];
    let item = findAPiItemByName(name) as ApiNameSpace | ApiObj;
    if (!item) {
        const is_wx = name === 'wx';
        const type = is_wx ? ApiType.Namespace : ApiType.Obj;
        item = {
            id: genId(),
            type,
            name,
            comment: '',
            props: {},
        };
        api_map[item.id] = item;
    }

    return item;
}

function findAPiItemByName(name: string) {
    for (const id in api_map) {
        if (!api_map.hasOwnProperty(id)) {
            continue;
        }
        const item = api_map[id];
        if (item.name === name) {
            return item;
        }
    }
}
