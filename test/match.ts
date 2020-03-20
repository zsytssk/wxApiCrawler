import { ApiType, ApiBase, ApiObj, ApiFun } from '../src/api';
import { SubChildRawInfo, SubChildRawType } from './test';
import { TableInfo } from 'parseHtml/parseTable';

const match_arr: MatchItem[] = [];

type MatchRawItem = {
    type: ApiType;
    level: number;
};
type MatchRequire = 'params' | 'return_type';
type MatchItem = MatchRawItem & {
    item: ApiBase;
    require_arr?: MatchRequire[];
    match_fun: (match_info: SubChildRawInfo) => boolean;
};
export function runMatch(item: SubChildRawInfo) {
    for (let len = match_arr.length, i = len - 1; i >= 0; i++) {
        const is_match = match_arr[i].match_fun(item);
        if (is_match) {
            break;
        }
    }
}
export function putMatch(name: string, raw_item: MatchRawItem) {
    const { type, level } = raw_item;
    const item = {
        name,
        type,
    } as ApiBase;

    const match_item = {
        type,
        level,
        require_arr: [],
        item,
    } as MatchItem;
    match_item.match_fun = createMatchFun(match_item);
    match_arr.push(match_item);
}
/** 抽离 match 的信息 */
export function extraMatchResult() {
    console.log(match_arr);
    return match_arr[0].item;
}

function createMatchFun(own_item: MatchItem): MatchItem['match_fun'] {
    const { type } = own_item;

    if (type === ApiType.Fun) {
        return createMatchFunFun(own_item);
    } else if (type === ApiType.Obj) {
        return createMatchObjFun(own_item);
    } else {
        return createMatchPrimeFun(own_item);
    }
}

function createMatchFunFun(own_item: MatchItem): MatchItem['match_fun'] {
    const { level } = own_item;
    const item = own_item.item as ApiFun;
    return (raw_item: SubChildRawInfo) => {
        const { level: match_level, con, type } = raw_item;
        if (level >= match_level) {
            outMatch(own_item);
            return false;
        }
        if (type === SubChildRawType.Text) {
            let txt_con = con as string;
            if (txt_con.indexOf('返回值') !== 0) {
                own_item.require_arr.push('params');
                return true;
            } else if (txt_con.indexOf('参数') !== 0) {
                own_item.require_arr.push('return_type');
                return true;
            }
            item.comment = con as string;
        } else if (type === SubChildRawType.Table) {
            for (const con_item of con as TableInfo[]) {
                const { name, comment, type } = con_item;
                if (type === ApiType.Fun || type === ApiType.Obj) {
                    putMatch(name, { type, level: level + 1 });
                }
            }
        }
        return true;
    };
}

function createMatchObjFun(own_item: MatchItem): MatchItem['match_fun'] {
    const { level } = own_item;
    const item = own_item.item as ApiObj;
    return (raw_item: SubChildRawInfo) => {
        const { level: match_level, con, type } = raw_item;
        if (level >= match_level) {
            outMatch(own_item);
            return false;
        }
        if (type === SubChildRawType.Text) {
            let txt_con = con as string;
            item.comment = txt_con;
        } else if (type === SubChildRawType.Table) {
            for (const con_item of con as TableInfo[]) {
                if (!item.props) {
                    item.props = {};
                }
                const { name, comment, type } = con_item;
                item.props[con_item.name] = {
                    name,
                    comment,
                    type,
                };
                if (type === ApiType.Fun || type === ApiType.Obj) {
                    putMatch(name, { type, level: level + 1 });
                }
            }
        }
        return true;
    };
}

function createMatchPrimeFun(own_item: MatchItem): MatchItem['match_fun'] {
    const { level, item } = own_item;
    return (raw_item: SubChildRawInfo) => {
        const { level: match_level, con, type } = raw_item;
        if (level <= match_level) {
            outMatch(own_item);
            return false;
        }
        if (type === SubChildRawType.Text) {
            item.comment = con as string;
            outMatch(own_item);
        }
        return true;
    };
}

function outMatch(item: MatchItem) {
    const index = match_arr.indexOf(item);
    if (index === -1) {
        console.error(`cant find match item in match_arr`);
        return;
    }
    match_arr.splice(index, 1);
}
