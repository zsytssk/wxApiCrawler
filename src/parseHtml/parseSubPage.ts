import { ApiBase, ApiFun, ApiObj, ApiType } from '../api';
import { base_url } from '../main';
import { queryAllItem, queryItem, queryNext } from '../utils/query';
import { genId } from '../utils/utils';
import { detectSubType, findNextInfo, getFunName } from './findItem';
import { parseUrl } from './parseHtml';

export async function parseSubPage(url: string) {
    const $ = await parseUrl(base_url + url);
    const $con = $('#docContent .content');
    const name = $('h1', $con).text();
    const type = detectSubType(name);
    // console.log(name, type);
    if (type === ApiType.Fun) {
        return parseFun($, name);
    }
}

/** 解析函数的类型 */
function parseFun($: CheerioStatic, name: string): Partial<ApiBase> {
    const con_dom = queryItem($, '#docContent');
    const fun_name = getFunName(name);
    const h1 = queryItem($, 'h1', con_dom);
    const result = { name: fun_name, type: ApiType.Fun } as ApiFun;
    const section_list = queryAllItem($, 'h2', con_dom);
    const comment_dom = queryNext(h1);
    if (comment_dom) {
        const comment = $(comment_dom).text();
        result.comment = comment;
    }

    for (const item of section_list) {
        const h2_text = $(item).attr('id');
        if (h2_text === '返回值') {
            let return_type = {
                name: 'return_type',
                comment: '',
                type: ApiType.Obj,
            } as ApiBase;
            const return_info = findNextInfo(item, $);
            return_type = {
                ...return_type,
                ...return_info,
            };
            result.return = return_type;
        } else if (h2_text === '参数') {
            const params = [];
            const name_dom = queryNext(item);
            const id = $(name_dom).attr('id');
            const name = id.split('-')[1];
            const return_info = findNextInfo(item, $);
            params.push({
                id: genId(),
                name,
                comment: '',
                type: ApiType.Obj,
                ...return_info,
            } as ApiObj);
            result.params = params;
        }
    }

    return result;
}
