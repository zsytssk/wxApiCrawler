import * as path from 'path';
import { getUrl } from './net';
import { parseHtml, parseItem } from './parseHtml/parseHtml';
import { queryAllItem } from './parseHtml/findItem';
import { rm } from './utils/ls/rm';

export const base_url = 'https://developers.weixin.qq.com/minigame/dev/api/';

async function main() {
    console.time('build');
    const html = await getUrl(base_url);
    const $ = parseHtml(html);
    const list = queryAllItem($, '#docContent .table-wrp');
    await rm(path.resolve(__dirname, '../dist/'));
    for (const item of list) {
        if (item === list[1]) {
            await parseItem(item, $);
        }
    }
    console.timeEnd('build');
    // console.log($($('#docContent')[0]).html());
}

main();
