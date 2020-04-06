import { TableInfo } from './parseTable';
import { ApiBase, ApiFun, ApiObj, ApiType } from '../api';
import { SubChildRawInfo, SubChildRawType } from './parseUtils';

let match_arr: MatchItem[] = [];

type MatchRawItem = {
    type: ApiType;
    level: number;
    trigger: boolean;
};
type MatchFun = (match_info: SubChildRawInfo) => boolean;
type MatchItem = MatchRawItem & {
    item: ApiBase;
    trigger: boolean;
    trigger_fun: MatchFun;
    match_sub_arr?: MatchFun[];
    match_fun: MatchFun;
};

export function runMatch(item: SubChildRawInfo) {
    for (let len = match_arr.length, i = len - 1; i >= 0; i--) {
        const { match_fun, trigger, trigger_fun } = match_arr[i];

        /** 跳过没有打开的 */
        if (!trigger && !trigger_fun(item)) {
            continue;
        }

        const is_match = match_fun(item);
        if (is_match) {
            break;
        }
    }
}

export function putMatch(name: string, raw_item: MatchRawItem, item?: ApiBase) {
    const { type, level, trigger } = raw_item;
    if (!item) {
        item = {
            name,
            type,
        } as ApiBase;
    }
    const match_sub_arr = [];
    const match_item = {
        type,
        level,
        item,
        trigger,
    } as MatchItem;

    const match_sub_comment = createMatchSubCommentFun(item);
    match_sub_arr.push(match_sub_comment);
    match_item.match_sub_arr = match_sub_arr;
    if (!trigger) {
        match_item.trigger_fun = createTriggerFun(match_item);
    }
    match_item.match_fun = createMatchFun(match_item);
    match_arr.push(match_item);

    return item;
}
/** 抽离 match 的信息 */
export function extraMatchResult() {
    const result = match_arr[0].item;
    match_arr = [];
    return result;
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
function createTriggerFun(own_item: MatchItem): MatchItem['match_fun'] {
    const { level, item } = own_item;

    return (raw_item: SubChildRawInfo) => {
        const { level: match_level, con } = raw_item;

        if (level >= match_level) {
            outMatch(own_item);
            return false;
        }
        if (typeof con !== 'string') {
            return false;
        }
        if (con.indexOf(item.name) !== -1) {
            own_item.trigger = true;
            return true;
        }
    };
}

function createMatchFunFun(own_item: MatchItem): MatchItem['match_fun'] {
    const { level, match_sub_arr } = own_item;
    const item = own_item.item as ApiFun;
    return (raw_item: SubChildRawInfo) => {
        const { level: match_level, con, type } = raw_item;
        if (level >= match_level) {
            outMatch(own_item);
            return false;
        }
        if (type === SubChildRawType.Text) {
            const txt_con = con as string;
            if (txt_con.indexOf('返回值') !== -1) {
                match_sub_arr.push(createMatchSubReturnFun(item));
                return true;
            } else if (txt_con.indexOf('参数') !== -1) {
                item.params = [];
                match_sub_arr.push(createMatchSubParamsFun(item));
                return true;
            }
        }
        for (let len = match_sub_arr.length, i = len - 1; i >= 0; i--) {
            const match_sub_fn = match_sub_arr[i];
            const is_match = match_sub_fn(raw_item);
            if (is_match) {
                // match_sub_arr.splice(i, 1);
                return true;
            }
        }
        return true;
    };
}

function createMatchObjFun(own_item: MatchItem): MatchItem['match_fun'] {
    const { level, match_sub_arr } = own_item;
    const item = own_item.item as ApiObj;
    return (raw_item: SubChildRawInfo) => {
        const { level: match_level, con, type } = raw_item;
        if (level >= match_level) {
            outMatch(own_item);
            return false;
        }
        for (let len = match_sub_arr.length, i = len - 1; i >= 0; i--) {
            const match_sub_fn = match_sub_arr[i];
            const is_match = match_sub_fn(raw_item);
            if (is_match) {
                match_sub_arr.splice(i, 1);
                return true;
            }
        }

        if (type === SubChildRawType.Table) {
            for (const con_item of con as TableInfo[]) {
                if (!item.props) {
                    item.props = {};
                }
                const { name, comment, type: _type } = con_item;
                const new_item = {
                    name,
                    comment,
                    type: _type,
                };
                if (_type === ApiType.Fun || _type === ApiType.Obj) {
                    putMatch(
                        name,
                        { type: _type, level: level + 0.5, trigger: false },
                        new_item,
                    );
                }

                item.props[name] = new_item;
            }
        }
        return true;
    };
}

function createMatchPrimeFun(own_item: MatchItem): MatchItem['match_fun'] {
    const { level, match_sub_arr } = own_item;
    return (raw_item: SubChildRawInfo) => {
        const { level: match_level } = raw_item;
        if (level >= match_level) {
            outMatch(own_item);
            return false;
        }
        for (let len = match_sub_arr.length, i = len - 1; i >= 0; i--) {
            const match_sub_fn = match_sub_arr[i];
            const is_match = match_sub_fn(raw_item);
            if (is_match) {
                match_sub_arr.splice(i, 1);
                if (!match_sub_arr.length) {
                    outMatch(own_item);
                }
                return true;
            }
        }
        return true;
    };
}

/** 创建注释监听 */
function createMatchSubCommentFun(item: ApiBase): MatchItem['match_fun'] {
    const fn = (raw_item: SubChildRawInfo) => {
        const { con, type } = raw_item;
        if (type === SubChildRawType.Text) {
            item.comment = con as string;
            return true;
        }
        return false;
    };

    fn.fn_name = 'createMatchSubCommentFun';
    return fn;
}

/** 创建函数参数监听 */
function createMatchSubParamsFun(item: ApiFun): MatchItem['match_fun'] {
    const fn = (raw_item: SubChildRawInfo) => {
        const { level: match_level, con, type, ref_name } = raw_item;

        if (type === SubChildRawType.Text) {
            const { type: _type, name } = detectType(con as string);
            const param_item = {
                name,
                type: _type,
                ref_name,
            } as ApiBase;
            item.params.push(param_item);
            putMatch(
                name,
                { type: _type, level: match_level, trigger: true },
                param_item,
            );
            return true;
        }
        return false;
    };

    fn.fn_name = 'createMatchSubParamsFun';
    return fn;
}

/** 创建函数返回值监听 */
function createMatchSubReturnFun(item: ApiFun): MatchItem['match_fun'] {
    const fn = (raw_item: SubChildRawInfo) => {
        const { level: match_level, con, type, ref_name } = raw_item;
        if (type === SubChildRawType.Text) {
            const { type: _type, name } = detectType(con as string);
            const param_item = {
                name,
                type: _type,
                ref_name,
            } as ApiBase;
            item.return_type = param_item;
            putMatch(
                name,
                { type: _type, level: match_level, trigger: true },
                param_item,
            );
            return true;
        }
        return false;
    };
    fn.fn_name = 'createMatchSubReturnFun';
    return fn;
}

function outMatch(item: MatchItem) {
    const index = match_arr.indexOf(item);
    if (index === -1) {
        console.error(`cant find match item in match_arr`);
        return;
    }
    match_arr.splice(index, 1);
}

const reg_fun1 = /[^\(]+\([^\)]*\)/;
const reg_fun2 = /function/;
const reg_fun2_name = /function[^\w]+(\w+)/;
const reg_fun_name = /([^\s\.]+)\([^\(]*\)/;
const reg_object = /Object[^\w](\w+)/;
export function detectType(
    test_str: string,
): {
    type: ApiType;
    name: string;
} {
    if (reg_fun1.test(test_str)) {
        const name = reg_fun_name.exec(test_str)[1];
        return {
            type: ApiType.Fun,
            name,
        };
    }
    if (reg_fun2.test(test_str)) {
        const name = reg_fun2_name.exec(test_str)[1];
        return {
            type: ApiType.Fun,
            name,
        };
    }
    if (reg_object.test(test_str)) {
        const name = reg_object.exec(test_str)[1];
        return {
            type: ApiType.Obj,
            name,
        };
    }
    return {
        type: ApiType.Str,
        name: test_str,
    };
}
