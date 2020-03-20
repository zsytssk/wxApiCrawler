import * as cheerio from 'cheerio';
import { ApiMap } from '../api';
import { write } from '../utils/ls/write';
import { stringify } from '../utils/stringify';
import { queryPrev, queryAllItem } from './query';
import { matchTable } from './matchTable';
import { parseSubPage } from './parseSubPage';
import { getUrl } from '../utils/net';

export const api_map = {} as ApiMap;
export async function parseUrl(url: string) {
    const html = await getUrl(url);
    const $ = cheerio.load(html, {
        ignoreWhitespace: true,
        decodeEntities: false,
    });
    return $;
}
export function parseHtml(str: string) {
    const $ = cheerio.load(str, {
        ignoreWhitespace: true,
        decodeEntities: false,
    });
    return $;
}

export async function parseItem(item: CheerioElement, $: CheerioStatic) {
    const prev = queryPrev(item, { tag: ['h3', 'h4'] });
    const name = $(prev).attr('id');

    const list: CheerioElement[] = queryAllItem($, 'tbody tr', item);

    for (const item of list) {
        const { name, comment, url } = matchTable($('td', item), $);
        try {
            const sub_info = await parseSubPage(url);
            await write(
                `./dist/${sub_info.name}.json`,
                stringify(sub_info, 10),
            );
        } catch (err) {
            console.error(`parseSubPage:>error:>`, name);
        }
    }
}
