import { getUrl } from './net';
import { parseHtml, parseItem } from './parseHtml/parseHtml';

export const base_url = 'https://developers.weixin.qq.com/minigame/dev/api/';

async function main() {
    const html = await getUrl(base_url);
    const $ = parseHtml(html);
    const $con = $('#docContent .table-wrp');
    $con.each((index, item) => {
        parseItem(item, $);
        if (index > 2) {
            return false;
        }
    });
    // console.log($($('#docContent')[0]).html());
}

main();
