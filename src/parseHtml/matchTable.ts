import { ApiType } from 'api';

export function matchTable(item: Cheerio, $: CheerioStatic) {
    if (item.length === 2) {
        const { name, url } = parseTbName(item[0], $);
        const comment = parseTbOther(item[1], $);
        return {
            name,
            comment,
            url,
        };
    }
    if (item.length > 2 && item.length < 5) {
        const { name, url } = parseTbName(item[0], $);
        const type = parseTbOther(item[1], $) as ApiType;
        const comment = parseTbOther(item[2], $);

        return {
            name,
            type,
            comment,
            url,
        };
    } else if (item.length === 5) {
        const { name, url } = parseTbName(item[0], $);
        const type = parseTbOther(item[1], $) as ApiType;
        const comment = parseTbOther(item[4], $);

        return {
            name,
            type,
            comment,
            url,
        };
    }
}

export function parseTbName(item: CheerioElement, $: CheerioStatic) {
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
export function parseTbOther(item: CheerioElement, $: CheerioStatic) {
    return $(item).text();
}
