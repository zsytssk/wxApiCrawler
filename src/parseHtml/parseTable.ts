import { ApiType } from 'api';

export type TableInfo = {
    name: string;
    url?: string;
    comment?: string;
    type?: ApiType;
};
export function parseTable($table: Cheerio, $: CheerioStatic) {
    const result = [] as TableInfo[];
    const tr_list = $('tbody tr', $table);
    tr_list.each((index, tr) => {
        const item_info = parseTd($('td', tr), $);
        result.push(item_info as TableInfo);
    });

    return result;
}

function parseTd(td: Cheerio, $: CheerioStatic) {
    if (td.length === 2) {
        const { name, url } = parseTbName(td[0], $);
        const comment = parseTbOther(td[1], $);
        return {
            name,
            comment,
            url,
        };
    }
    if (td.length > 2 && td.length < 5) {
        const { name, url } = parseTbName(td[0], $);
        const type = parseTbOther(td[1], $).toLowerCase() as ApiType;
        const comment = parseTbOther(td[2], $);

        return {
            name,
            type,
            comment,
            url,
        };
    } else if (td.length === 5) {
        const { name, url } = parseTbName(td[0], $);
        const type = parseTbOther(td[1], $).toLowerCase() as ApiType;
        const comment = parseTbOther(td[4], $);

        return {
            name,
            type,
            comment,
            url,
        };
    } else if (td.length === 6) {
        const { name, url } = parseTbName(td[0], $);
        const type = parseTbOther(td[1], $).toLowerCase() as ApiType;
        const comment = parseTbOther(td[4], $);

        return {
            name,
            type,
            comment,
            url,
        };
    }
}

function parseTbName(item: CheerioElement, $: CheerioStatic) {
    const a_tag = $('a', item);
    let name: string;
    let url: string;
    if (a_tag.length) {
        name = a_tag.text();
        url = a_tag.attr('href');
    } else {
        name = $(item).text();
    }
    return {
        name,
        url,
    };
}
function parseTbOther(item: CheerioElement, $: CheerioStatic) {
    return $(item).text();
}
