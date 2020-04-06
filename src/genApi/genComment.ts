import { ApiBase, ApiFun, ApiType } from 'api';
import { genTab } from 'utils/utils';

const comment_tpl = `/** $1 */`;
export function genComment(api: ApiBase, tab_size = 0) {
    const { type, comment } = api;
    if (!comment) {
        return '';
    }
    if (type === ApiType.Fun) {
        return genFunComment(api as ApiFun, tab_size);
    }
    if (comment) {
        return comment_tpl.replace('$1', comment);
    }
}

const fn_comment_tpl = `/**
    * $1 $2*/`;
const fn_param_comment_tpl = `* @param $1 $2`;
const fn_return_comment_tpl = `* @returns  $1 $2`;
export function genFunComment(api: ApiFun, tab_size = 0) {
    const { comment, params, return_type } = api;
    let result = '';
    let params_str = '';
    for (const item of params || []) {
        const { comment: _comment, name } = item;
        if (!_comment) {
            continue;
        }
        params_str += genTab(tab_size, true);
        params_str += fn_param_comment_tpl
            .replace('$1', name)
            .replace('$2', _comment);
    }

    let return_str = '';
    if (return_type) {
        const { comment: _comment, name } = return_type as ApiBase;
        if (_comment) {
            return_str += genTab(tab_size, true);
            return_str += fn_return_comment_tpl
                .replace('$1', name)
                .replace('$2', _comment);
        }
    }
    if (params_str || return_str) {
        result = fn_comment_tpl.replace('$1', comment);
        const inner = params_str + return_str + genTab(tab_size, true);
        result = result.replace('$2', inner);
    } else {
        result = comment_tpl.replace('$1', comment);
    }
    return result;
}
