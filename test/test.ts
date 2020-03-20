import { base_url } from '../src/main';
import { parseUrl } from '../src/parseHtml/parseHtml';
import { parseTable, TableInfo } from '../src/parseHtml/parseTable';
import { isEmpty } from '../src/utils/query';
import { putMatch, runMatch, extraMatchResult } from './match';
import { detectSubType, getFunName } from '../src/parseHtml/findItem';
import { ApiType } from '../src/api';

async function main() {
    const $ = await parseUrl(base_url);
    const con = $('#docContent .content')[0];

    let i = 0;
    for (const item of con.childNodes) {
        if (isEmpty(item)) {
            continue;
        }
        if (!$(item).is('.table-wrp')) {
            continue;
        }
        /** @test */
        if (i === 3) {
            const info_list = parseTable($(item), $);
            for (const item_info of info_list) {
                const { url, name } = item_info;
                console.log(name);

                /** @test */
                if (name === 'wx.onShow') {
                    parseSubPage(url);
                    return;
                }
            }
        }

        i++;
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
        const { type, con, level } = info;
        if (type !== SubChildRawType.Table) {
            console.log(type, con, level);
        }
        const is_put_match = detectPutMatch(info);
        if (!is_put_match) {
            runMatch(info);
        }
    }
    const result = extraMatchResult();
    console.log(result);
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

function detectPutMatch(item: SubChildRawInfo) {
    const { con, level } = item;
    if (level === 1) {
        const type = detectSubType(con as string);
        let name = con as string;
        if (type === ApiType.Fun) {
            name = getFunName(name);
        }
        putMatch(name, {
            level,
            type,
        });

        return true;
    }

    return false;
}

main();
