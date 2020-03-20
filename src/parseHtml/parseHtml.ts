import * as cheerio from 'cheerio';
import { ApiMap } from '../api';
import { write } from '../utils/ls/write';
import { getUrl } from '../utils/net';
import { stringify } from '../utils/stringify';
import { parseSubPage } from './parseSubPage';
import { parseTable } from './parseTable';

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

export async function parseItem(table: CheerioElement, $: CheerioStatic) {
    const info_list = parseTable($(table), $);
    for (const item_info of info_list) {
        const { url, name } = item_info;
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
