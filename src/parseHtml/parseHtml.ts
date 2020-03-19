import * as cheerio from 'cheerio';
import { ApiMap } from '../api';
import { write } from '../utils/ls/write';
import { stringify } from '../utils/stringify';
import { findPrev, queryItem } from './findItem';
import { matchTable } from './matchTable';
import { parseSubPage } from './parseSubPage';

export const api_map = {} as ApiMap;
export function parseHtml(str: string) {
    const $ = cheerio.load(str, {
        ignoreWhitespace: true,
        decodeEntities: false,
    });
    return $;
}

export async function parseItem(item: CheerioElement, $: CheerioStatic) {
    const prev = findPrev(item, { tag: ['h3', 'h4'] });
    const name = $(prev).attr('id');

    const list: CheerioElement[] = queryItem($, 'tbody tr', item);

    for (const item of list) {
        const { name, comment, url } = matchTable($('td', item), $);
        try {
            const sub_info = await parseSubPage(url);
            await write(
                `./dist/${sub_info.name}.json`,
                stringify(sub_info, 10),
            );
        } catch (err) {
            console.log(name);
        }
    }
}
