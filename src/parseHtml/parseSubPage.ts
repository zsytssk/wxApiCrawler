import { ApiBase, ApiFun, ApiObj, ApiType } from '../api';
import { base_url } from '../main';
import { getUrl } from '../net';
import { genId } from '../utils/utils';
import { findNext, findNextTable } from './findItem';
import { parseHtml } from './parseHtml';

export async function parseSubPage(url: string) {
    const html = await getUrl(base_url + url);
    const $ = parseHtml(html);
    const $con = $('#docContent');
    const name = $('h1', $con).text();
    const type = detectSubType(name);
    // console.log(name, type);
    if (type === ApiType.Fun) {
        return parseFun($, name);
    }
}

/** 解析函数的类型 */
function parseFun($: CheerioStatic, name: string) {
    const $con = $('#docContent');
    const fun_name = getFunName(name);
    const result = { name: fun_name, type: ApiType.Fun } as ApiFun;
    const section_list = $('h2', $con);

    section_list.each((index, item) => {
        const h2_text = $(item).attr('id');
        if (h2_text === '返回值') {
            const return_type = {
                name: 'return_type',
                comment: '',
                type: ApiType.Obj,
            } as ApiBase;

            (return_type as ApiObj).props = findNextTable(item, $);
            result.return = return_type;
        }
        if (h2_text === '参数') {
            const params = [];
            const name_dom = findNext(item);
            const id = $(name_dom).attr('id');
            const name = id.split('-')[1];
            const props = findNextTable(item, $);
            params.push({
                id: genId(),
                name,
                comment: '',
                type: ApiType.Obj,
                props,
            } as ApiObj);
            result.params = params;
        }
    });

    return result;
}

const reg_fun = /[^\(]+\([^\)]*\)/;
const reg_fun_name = /([^\s\.]+)\([^\(]*\)/;
export function detectSubType(test_str: string): ApiType {
    if (reg_fun.test(test_str)) {
        return ApiType.Fun;
    }
    return ApiType.Obj;
}
export function getFunName(test_str: string): string {
    return reg_fun_name.exec(test_str)[1] as string;
}
