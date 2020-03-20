import { base_url } from '../src/main';
import { parseUrl } from '../src/parseHtml/parseHtml';
import { parseTable, TableInfo } from '../src/parseHtml/parseTable';
import { isEmpty } from '../src/utils/query';

async function main() {
    const $ = await parseUrl(base_url);
    const con = $('#docContent .content')[0];
    for (const item of con.childNodes) {
        if (isEmpty(item)) {
            continue;
        }
        if ($(item).is('.table-wrp')) {
            const info_list = parseTable($(item), $);
            for (const item_info of info_list) {
                const { url, name } = item_info;
                parseSubPage(url);
            }
            return;
        }
    }
}

async function parseSubPage(url: string) {
    const $ = await parseUrl(base_url + url);
    const con = $('#docContent .content')[0];
    for (const item of con.childNodes) {
        if (isEmpty(item)) {
            continue;
        }
        const info = parseSubChildRawInfo(item, $);
        if (!info) {
            continue;
        }
        const { type, con } = info;
        if (type !== SubChildRawType.Table) {
            console.log(type, con);
        }
    }
}

export enum SubChildRawType {
    Name = 'name',
    Text = 'text',
    Table = 'table',
}
export type SubChildRawInfo = {
    type: SubChildRawType;
    level: number;
    con: string | TableInfo[];
};
/** 解析刺激页面item的原始信息 */
function parseSubChildRawInfo(
    item: CheerioElement,
    $: CheerioStatic,
): SubChildRawInfo {
    const tag_list = ['h1', 'h2', 'h3', 'h4'];
    const tag = item.tagName;
    if (tag_list.indexOf(tag) !== -1) {
        const level = Number(tag[1]);
        return {
            type: SubChildRawType.Text,
            con: $(item).text(),
            level,
        };
    }
    if (tag === 'p') {
        return {
            type: SubChildRawType.Text,
            con: $(item).text(),
            level: 10,
        };
    }
    if ($(item).is('.table-wrp')) {
        return {
            type: SubChildRawType.Table,
            con: parseTable($(item), $),
            level: 10,
        };
    }
}

main();
