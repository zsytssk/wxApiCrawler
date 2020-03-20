import { ApiType, ApiBase, ApiObj } from '../src/api';
import { SubChildRawInfo, SubChildRawType } from './test';
import { TableInfo } from 'parseHtml/parseTable';

const match_arr: MatchItem[] = [];

type MatchRawItem = {
    type: ApiType;
    level: number;
};
type MatchItem = MatchRawItem & {
    item: ApiBase;
    match_fun: (match_info: SubChildRawInfo) => void;
};
export function putMatch(name: string, raw_item: MatchRawItem) {
    const { type, level } = raw_item;
    const item = {
        name,
        type,
    } as ApiBase;

    const match_item = {
        type,
        level,
        item,
    } as MatchItem;
    match_item.match_fun = createMatchFun(match_item);
    match_arr.push(match_item);
}
/** 抽离 match 的信息 */
export function extraMatchResult() {}

function createMatchFun(own_item: MatchItem): MatchItem['match_fun'] {
    const { level, type } = own_item;

    if (type === ApiType.Fun) {
        return createMatchFunFun(own_item);
    } else if (type === ApiType.Obj) {
        return createMatchObjFun(own_item);
    } else {
        return createMatchPrimeFun(own_item);
    }
}

function createMatchFunFun(own_item: MatchItem): MatchItem['match_fun'] {
    const { level, item } = own_item;
    return (raw_item: SubChildRawInfo) => {
        const { level: match_level, con, type } = raw_item;
        if (level <= match_level) {
            return outMatch(own_item);
        }
        if (type === SubChildRawType.Text) {
            item.comment = con as string;
        } else if (type === SubChildRawType.Table) {
            for (const con_item of con as TableInfo[]) {
                const { name, comment, type } = con_item;
            }
        }
    };
}

function createMatchObjFun(own_item: MatchItem): MatchItem['match_fun'] {
    const { level } = own_item;
    const item = own_item.item as ApiObj;
    return (raw_item: SubChildRawInfo) => {
        const { level: match_level, con, type } = raw_item;
        if (level <= match_level) {
            return outMatch(own_item);
        }
        if (type === SubChildRawType.Text) {
            item.comment = con as string;
        } else if (type === SubChildRawType.Table) {
            for (const con_item of con as TableInfo[]) {
                const { name, comment, type } = con_item;
                item.props[con_item.name] = {
                    name,
                    comment,
                    type,
                };
            }
        }
    };
}
function createMatchPrimeFun(own_item: MatchItem): MatchItem['match_fun'] {
    const { level, item } = own_item;
    return (raw_item: SubChildRawInfo) => {
        const { level: match_level, con, type } = raw_item;
        if (level <= match_level) {
            return outMatch(own_item);
        }
        if (type === SubChildRawType.Text) {
            item.comment = con as string;
            outMatch(own_item);
        }
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
