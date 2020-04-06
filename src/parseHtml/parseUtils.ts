import * as cheerio from 'cheerio';
import { getUrl } from 'utils/net';
import { detectType, putMatch } from './parseMatch';
import { parseTable, TableInfo } from './parseTable';
import { isEmpty } from 'utils/query';

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
    ref_name?: string;
};
/** 解析刺激页面item的原始信息 */
export function parseSubChildRawInfo(
    item: CheerioElement,
    $: CheerioStatic,
): SubChildRawInfo {
    const tag_list = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const tag = item.tagName;

    if ($(item).is('.table-wrp')) {
        return {
            type: SubChildRawType.Table,
            con: parseTable($(item), $),
            level: 10,
        };
    }
    const [con, ref_name] = extraCon(item, $);
    if (tag_list.indexOf(tag) !== -1) {
        const level = Number(tag[1]);
        return {
            type: SubChildRawType.Text,
            con,
            ref_name,
            level,
        };
    }
    if (tag === 'p') {
        return {
            type: SubChildRawType.Text,
            con,
            ref_name,
            level: 10,
        };
    }
}

function extraCon(node: CheerioElement, $: CheerioStatic) {
    const a = $('a', node);
    const node_text = $(node).text();
    let ref_name = '';
    if (a.length) {
        // tslint:disable-next-line
        for (let i = 0; i < a.length; i++) {
            const item = $(a[i]);
            const item_text = item.text();
            const is_rel_con = node_text === `# ` + item_text;
            if (is_rel_con) {
                ref_name = item.text();
                break;
            }
        }
    }
    return [node_text, ref_name];
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
const ignore_arr = [`# 示例代码`, '# 注意'];
export function isIgnore(item: SubChildRawInfo) {
    const { con } = item;

    if (typeof con === 'string' && ignore_arr.indexOf(con as string) !== -1) {
        return true;
    }

    return false;
}
