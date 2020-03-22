import { ApiBase, ApiMap, ApiNameSpace, ApiObj, ApiType } from 'api';
import { stringify } from 'utils/stringify';
import { genId, saveToFile } from 'utils/utils';

export const api_map: ApiMap = {};

export async function orgApi(item_api: ApiBase) {
    const { full_name, name } = item_api;

    /** @test */
    await saveToFile(`${name}.json`, stringify(item_api, 10));

    const parent_api = detectParentType(full_name);
    if (!parent_api) {
        return;
    }
    parent_api.props[name] = item_api;
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
        api_map[name] = item;
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
