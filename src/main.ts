import { getUrl } from './net';
import { parseHtml, parseItem } from './parseHtml/parseHtml';
import { queryItem } from './parseHtml/findItem';

export const base_url = 'https://developers.weixin.qq.com/minigame/dev/api/';

async function main() {
    console.time('build');
    const html = await getUrl(base_url);
    const $ = parseHtml(html);
    const list = queryItem($, '#docContent .table-wrp');
    for (const item of list) {
        await parseItem(item, $);
    }
    console.timeEnd('build');
    // console.log($($('#docContent')[0]).html());
}

main();
