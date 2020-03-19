import { ApiType, ApiBase, ApiFun, ApiObj } from '../api';
import { matchTable } from './matchTable';
import { genId } from '../utils/utils';

type FilterProps = {
    tag?: string[];
    class_name?: string;
    attr?: { name: string; contain: string };
};

export function findPrev(
    item: CheerioElement,
    filter?: FilterProps,
): CheerioElement {
    let prev: CheerioElement = item.prev;

    /** 过滤prev */
    if (prev.type === 'text' && prev.data === ' ') {
        return findPrev(prev, filter);
    }
    if (filter) {
        if (filter.tag.indexOf(prev.name) === -1) {
            return findPrev(prev, filter);
        }
    }
    return prev;
}

export function findNext(
    item: CheerioElement,
    filter?: FilterProps,
): CheerioElement {
    let next: CheerioElement = item.next;
    if (!next) {
        return;
    }

    /** 过滤prev */
    if (next.type === 'text' && next.data === ' ') {
        return findNext(next, filter);
    }

    if (filter) {
        if (filter.tag && filter.tag.indexOf(next.name) === -1) {
            return findNext(next, filter);
        }

        if (filter.class_name) {
            const class_str = next.attribs.class;
            const class_arr = class_str?.split(' ');
            if (!class_arr || class_arr.indexOf(filter.class_name) === -1) {
                return findNext(next, filter);
            }
        }

        if (filter.attr) {
            const { name, contain } = filter.attr;
            const attr = next.attribs[name];
            if (!attr && attr.indexOf(contain) === -1) {
                return findNext(next, filter);
            }
        }
    }
    return next;
}

/** 寻找下一级属性的类型 */
export function findNextSubObj(
    name: string,
    item: CheerioElement,
    $: CheerioStatic,
): ApiObj {
    const next_p = findNext(item, { tag: ['p', 'h4'] });
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
        comment: '',
        type: ApiType.Obj,
        props,
    };
}
/** 寻找下一级函数的类型 */
export function findNextSubFun(
    name: string,
    item: CheerioElement,
    $: CheerioStatic,
): ApiFun {
    const next_p = findNext(item, {
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
    const next_params_ele = findNext(next_p, {
        tag: ['p', 'h4', 'h5'],
        attr: { name: 'id', contain: '参数' },
    });
    if (next_params_ele) {
        const name_dom = findNext(next_params_ele);
        const id = $(name_dom).attr('id');
        const name = id.split('-')[1];
        const props = findNextTable(next_params_ele, $);
        params.push({
            id: genId(),
            name,
            comment: '',
            type: ApiType.Obj,
            props,
        } as ApiObj);
    }
    const next_return_ele = findNext(next_p, {
        tag: ['p', 'h4', 'h5'],
        attr: { name: 'id', contain: '返回值' },
    });
    if (next_return_ele) {
        const props = findNextTable(next_params_ele, $);
        return_type = {
            id: genId(),
            comment: '',
            type: ApiType.Obj,
            props,
        } as ApiObj;
    }

    return {
        name,
        type: ApiType.Fun,
        params,
        return: return_type,
        comment: '',
        id: genId(),
    };
}

export function findNextTable(item: CheerioElement, $: CheerioStatic) {
    const $table = findNext(item, { class_name: 'table-wrp' });
    if (!$table) {
        return;
    }
    const result = {} as { [key: string]: ApiBase };
    const tr_list = $('tbody tr', $table);
    tr_list.each((index, tr) => {
        const { name, comment, type } = matchTable($('td', tr), $);
        result[name] = {
            name,
            comment,
            type,
        };

        if (type.toLowerCase() === ApiType.Obj) {
            const new_api = findNextSubObj(name, $table, $);
            if (new_api) {
                result[name] = {
                    ...new_api,
                    comment,
                };
            }
        }
        if (type.toLowerCase() === ApiType.Fun) {
            const new_api = findNextSubFun(name, $table, $);
            if (new_api) {
                result[name] = {
                    ...new_api,
                    comment,
                };
            }
        }
    });

    return result;
}

// tag.div
function matchItem(item: CheerioElement, selector: string): boolean {
    return false;
}
