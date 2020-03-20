import * as path from 'path';
import { parseItem, parseUrl } from './parseHtml/parseHtml';
import { rm } from './utils/ls/rm';
import { queryAllItem } from './utils/query';

export const base_url = 'https://developers.weixin.qq.com/minigame/dev/api/';

async function main() {
    console.time('build');
    const $ = await parseUrl(base_url);
    const list = queryAllItem($, '#docContent .table-wrp');
    await rm(path.resolve(__dirname, '../dist/'));
    for (const item of list) {
        if (item === list[0]) {
            await parseItem(item, $);
        }
    }
    console.timeEnd('build');
    // console.log($($('#docContent')[0]).html());
}

main();

// async function parseTable(item: CheerioElement, $: CheerioStatic) {
//     const list: CheerioElement[] = queryAllItem($, 'tbody tr', item);

//     for (const item of list) {
//         const { name, comment, url } = parseTable($('td', item), $);
//         try {
//             const sub_info = await parseSubPage(url);
//             await write(
//                 `./dist/${sub_info.name}.json`,
//                 stringify(sub_info, 10),
//             );
//         } catch (err) {
//             console.error(`parseSubPage:>error:>`, name);
//         }
//     }
// }
