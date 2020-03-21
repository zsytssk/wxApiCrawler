import * as path from 'path';
import { extraMatchResult, runMatch } from '../parseHtml/parseMatch';
import { parseTable } from '../parseHtml/parseTable';
import { clear } from '../utils/ls/rm';
import { write } from '../utils/ls/write';
import { isEmpty } from '../utils/query';
import { stringify } from '../utils/stringify';
import {
    $Url,
    detectPutMatch,
    isIgnore,
    parseSubChildRawInfo,
} from './parseUtils';

export async function parseHtml(base_url: string) {
    const $ = await $Url(base_url);
    const con = $('#docContent .content')[0];

    const dist = path.resolve(__dirname, '../dist');
    await clear(dist);

    for (const item of con.childNodes) {
        if (isEmpty(item)) {
            continue;
        }
        if (!$(item).is('.table-wrp')) {
            continue;
        }
        const info_list = parseTable($(item), $);
        for (const item_info of info_list) {
            const { url, name } = item_info;

            /** @test */
            // if (name !== 'wx.getSystemInfo') {
            //     continue;
            // }
            try {
                const result = await parseSubPage(base_url + url);
                const file_path = path.resolve(dist, `${result.name}.json`);
                await write(file_path, stringify(result, 10));
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
