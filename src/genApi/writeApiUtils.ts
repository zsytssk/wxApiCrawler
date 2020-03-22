import { ApiBase, ApiObj, ApiType, ApiFun, isPrime, ApiNameSpace } from 'api';
import upperFirst from 'lodash/fp/upperFirst';
import { genTab } from 'utils/utils';
import { addWriteStr } from './writeApi';

type SubType = 'normal' | 'prop';
const type_tpl = `type $1= $2;`;
export function genType(
    top_name: string,
    api: ApiBase,
    sub_type: SubType = 'prop',
    extra = false,
) {
    const { name: api_name, type } = api;
    if (isPrime(type)) {
        return type;
    }
    if (type === ApiType.Fun) {
        const fun_str = genFun(top_name, api as ApiFun, sub_type);
        if (!extra) {
            return fun_str;
        } else if (fun_str.length <= 30) {
            return fun_str;
        } else {
            const type_name = upperFirstName(top_name, api_name);
            const type_str = type_tpl
                .replace('$1', type_name)
                .replace('$2', fun_str);
            addWriteStr(type_str);
            return type_name;
        }
    }
    if (type === ApiType.Obj) {
        const { props } = api as ApiObj;
        let type_name = type;
        if (props) {
            type_name = upperFirstName(top_name, api_name);
            const extra_str = genInterface(top_name, api as ApiObj);
            addWriteStr(extra_str);
        }
        return type_name;
    }
}

const ns_tpl = `declare namespace $1 {$2}`;
const ns_prop_tpl = `export $1`;
export function genNamespace(ns: ApiNameSpace) {
    const { name, props } = ns;
    let result = ns_tpl.replace('$1', name);
    let inner = ``;
    for (const [key, item] of Object.entries(props)) {
        if (!props.hasOwnProperty(key)) {
            continue;
        }
        const type_str = genType('', item as ApiFun, 'normal');
        inner += genTab(1, true);
        inner += ns_prop_tpl.replace(`$1`, type_str);
    }
    inner += '\n';
    result = result.replace('$2', inner);
    return result;
}

const int_tpl = `interface $1 {$2}`;
const props_prop_tpl = `$1: $2;`;
function genInterface(top_name: string, api: ApiObj) {
    const { props, name } = api;

    if (!props) {
        return name;
    }
    const interface_name = upperFirstName(top_name, name);
    let result = int_tpl.replace(`$1`, interface_name);

    let inner = '';
    for (const [, item] of Object.entries(props)) {
        const { name: sub_name } = item;
        const type_name = genType(interface_name, item);

        inner += genTab(1, true);
        inner += props_prop_tpl
            .replace('$1', sub_name)
            .replace('$2', type_name);
    }
    inner += '\n';
    result = result.replace('$2', inner);
    return result;
}

const fun_prop_tpl = `($1) => $2`;
const fun_normal_tpl = `function $1($2): $3;`;

export function genFun(
    top_name: string,
    api: ApiFun,
    type: SubType = 'normal',
) {
    const { params, return_type, name } = api;

    let fun_name = name;
    if (top_name) {
        fun_name = upperFirstName(top_name, name);
    }
    const params_str = genFunParams(fun_name, params);
    const return_str = genFunReturn(fun_name, return_type as ApiBase);
    if (type === 'normal') {
        return fun_normal_tpl
            .replace('$1', fun_name)
            .replace('$2', params_str)
            .replace('$3', return_str);
    }
    return fun_prop_tpl.replace('$1', params_str).replace('$2', return_str);
}

const param_tpl = `$1: $2`;

export function genFunParams(top_name: string, params: ApiBase[] = []) {
    let params_str = '';
    for (const [index, param] of params.entries()) {
        const { name: sub_name, type } = param;
        let type_str = type as string;
        if (!isPrime(type)) {
            type_str = genType(top_name, param, 'prop', true);
        }
        params_str += param_tpl.replace(`$1`, sub_name).replace('$2', type_str);
        if (index !== params.length - 1) {
            params_str += ',';
        }
    }
    return params_str;
}

export function genFunReturn(top_name: string, api?: ApiBase) {
    if (!api) {
        return 'void';
    }

    const { type } = api;
    let type_name = type;
    if (!isPrime(type)) {
        type_name = genType(top_name, api, 'prop', true);
    }
    return type_name;
}

export function upperFirstName(name1: string, name2: string) {
    return upperFirst(name1) + upperFirst(name2);
}
