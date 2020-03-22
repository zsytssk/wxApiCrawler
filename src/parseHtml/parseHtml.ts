import { ApiBase } from 'api';
import * as path from 'path';
import { extraMatchResult, runMatch } from '../parseHtml/parseMatch';
import { parseTable } from '../parseHtml/parseTable';
import { clear } from '../utils/ls/rm';
import { isEmpty } from '../utils/query';
import {
    $Url,
    detectPutMatch,
    isIgnore,
    parseSubChildRawInfo,
} from './parseUtils';

type Listener = (item: ApiBase) => Promise<void>;
export async function parseHtml(base_url: string, listener: Listener) {
    const $ = await $Url(base_url);
    const con = $('#docContent .content')[0];

    const dist = path.resolve(__dirname, '../dist');
    await clear(dist);

    const child_list = con.childNodes.filter(item => {
        if (isEmpty(item)) {
            return false;
        }
        if (!$(item).is('.table-wrp')) {
            return false;
        }
        return true;
    });

    for (const [index, item] of child_list.entries()) {
        if (index > 2) {
            continue;
        }
        const info_list = parseTable($(item), $);

        for (const item_info of info_list) {
            const { url, name } = item_info;

            /** @test */
            // if (name !== 'UpdateManager.applyUpdate') {
            //     continue;
            // }
            try {
                const result = await parseSubPage(base_url + url);
                result.full_name = name;
                await listener(result);
            } catch (err) {
                console.log('\x1b[36m', `[${name}]:>`, '\x1b[0m', err);
            }
        }
    }
}

async function parseSubPage(url: string) {
    const $ = await $Url(url);
    const con = $('#docContent .content')[0];
    for (const item of con.childNodes) {
        if (isEmpty(item)) {
            continue;
        }
        const info = parseSubChildRawInfo(item, $);
        if (!info) {
            continue;
        }
        const is_put_match = detectPutMatch(info);
        const is_ignore = isIgnore(info);
        if (!is_put_match && !is_ignore) {
            runMatch(info);
        }
    }
    return extraMatchResult();
}
