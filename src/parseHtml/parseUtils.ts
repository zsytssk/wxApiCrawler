import * as cheerio from 'cheerio';
import { getUrl } from 'utils/net';
import { detectType, putMatch } from './parseMatch';
import { parseTable, TableInfo } from './parseTable';

export async function $Url(url: string) {
    const html = await getUrl(url);
    const $ = cheerio.load(html, {
        ignoreWhitespace: true,
        decodeEntities: false,
    });
    return $;
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
export function parseSubChildRawInfo(
    item: CheerioElement,
    $: CheerioStatic,
): SubChildRawInfo {
    const tag_list = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
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

export function detectPutMatch(item: SubChildRawInfo) {
    const { con, level } = item;
    if (level === 1) {
        const { type, name } = detectType(con as string);
        putMatch(name, {
            level,
            type,
            trigger: true,
        });

        return true;
    }

    return false;
}
export function isIgnore(item: SubChildRawInfo) {
    const { con, level } = item;
    if (con === `# 示例代码`) {
        return true;
    }

    return false;
}
