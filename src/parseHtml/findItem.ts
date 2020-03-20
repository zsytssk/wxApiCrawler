import { ApiBase, ApiFun, ApiObj, ApiType } from '../api';
import { queryNext } from '../utils/query';
import { genId } from '../utils/utils';
import { parseTable } from './parseTable';

/** 寻找下一级属性的类型 */
export function findNextSubObj(
    name: string,
    item: CheerioElement,
    $: CheerioStatic,
): Partial<ApiObj> {
    const next_p = queryNext(item, { tag: ['p', 'h4'] });
    if (!next_p) {
        return;
    }
    const next_p_con = $(next_p).text();
    if (next_p_con.indexOf(name) === -1) {
        return findNextSubObj(name, next_p, $);
    }
    const props = findNextTable(next_p, $);

    return {
        id: genId(),
        name,
        type: ApiType.Obj,
        props,
    };
}
/** 寻找下一级函数的类型 */
export function findNextSubFun(
    name: string,
    item: CheerioElement,
    $: CheerioStatic,
): Partial<ApiFun> {
    const next_p = queryNext(item, {
        tag: ['p', 'h4', 'h5'],
    });
    if (!next_p) {
        return;
    }
    const next_p_con = $(next_p).text();
    if (next_p_con.indexOf(name) === -1) {
        return findNextSubFun(name, next_p, $);
    }
    let params = [] as ApiBase[];
    let return_type = {} as ApiBase;
    const next_params_ele = queryNext(next_p, {
        tag: ['p', 'h4', 'h5'],
        attr: { name: 'id', contain: '参数' },
    });
    if (next_params_ele) {
        const name_dom = queryNext(next_params_ele);
        const id = $(name_dom).attr('id');
        const name = id.split('-')[1];
        const props = findNextTable(next_params_ele, $);
        params.push({
            id: genId(),
            name,
            type: ApiType.Obj,
            props,
        } as ApiObj);
    }
    const next_return_ele = queryNext(next_p, {
        tag: ['p', 'h4', 'h5'],
        attr: { name: 'id', contain: '返回值' },
    });
    if (next_return_ele) {
        const props = findNextTable(next_params_ele, $);
        return_type = {
            id: genId(),
            type: ApiType.Obj,
            props,
        } as ApiObj;
    }

    return {
        id: genId(),
        name,
        type: ApiType.Fun,
        params,
        return: return_type,
    };
}

export function findNextInfo(item: CheerioElement, $: CheerioStatic) {
    const info = findNextCommentOrName(item, $);
    const props = findNextTable(item, $);

    return {
        ...info,
        props,
    };
}

export function findNextTable(item: CheerioElement, $: CheerioStatic) {
    const table = queryNext(item, { class_name: 'table-wrp' });
    if (!table) {
        return;
    }
    const result = {} as { [key: string]: ApiBase };
    const info_list = parseTable($(table), $);
    for (const item_info of info_list) {
        const { name, comment, type } = item_info;
        result[name] = {
            name,
            comment,
            type,
        };

        if (type.toLowerCase() === ApiType.Obj) {
            const new_api = findNextSubObj(name, table, $) as ApiBase;
            if (new_api) {
                result[name] = {
                    comment,
                    ...new_api,
                };
            }
        }
        if (type.toLowerCase() === ApiType.Fun) {
            const new_api = findNextSubFun(name, table, $) as ApiFun;
            if (new_api) {
                result[name] = {
                    comment,
                    ...new_api,
                };
            }
        }
    }

    return result;
}

/** 寻找下一个name不是table信息 */
export function findNextCommentOrName(
    item: CheerioElement,
    $: CheerioStatic,
): Partial<ApiBase> {
    const $h3 = queryNext(item, { tag: ['h3'] });
    const result = {} as Partial<ApiBase>;
    if (!$h3) {
        const p = queryNext(item);
        if (p && p.tagName === 'p') {
            result.comment = $(p).text();
        }
    } else {
        const name = $($h3).attr('id');
        const type = detectSubType(name);
        const p = queryNext($h3);
        if (p && p.tagName === 'p') {
            result.comment = $(p).text();
        }
        result.name = name;
        result.type = type;
    }

    return result;
}

const reg_fun1 = /[^\(]+\([^\)]*\)/;
const reg_fun2 = /function/;
const reg_fun_name = /([^\s\.]+)\([^\(]*\)/;
const reg_object = /Object\s(\w+)/;
export function detectSubType(test_str: string): ApiType {
    if (reg_fun1.test(test_str)) {
        return ApiType.Fun;
    }
    if (reg_fun2.test(test_str)) {
        return ApiType.Fun;
    }
    if (reg_object.test(test_str)) {
        return ApiType.Obj;
    }
    return ApiType.Str;
}
export function getFunName(test_str: string): string {
    return reg_fun_name.exec(test_str)[1] as string;
}
export function getObjectName(test_str: string): string {
    return reg_object.exec(test_str)[1] as string;
}
