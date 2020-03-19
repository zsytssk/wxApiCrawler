import { getUrl, parseHtml } from './net';

async function main() {
    const con = await getUrl(
        'https://developers.weixin.qq.com/minigame/dev/api/',
    );
    const $ = parseHtml(con);
    console.log($($('.table-wrp')[0]).html());
}

main();
