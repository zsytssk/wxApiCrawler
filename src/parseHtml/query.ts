export function queryItem(
    $: CheerioStatic,
    ...params: [string, CheerioElement?]
) {
    return $(...params)[0];
}
export function queryAllItem(
    $: CheerioStatic,
    ...params: [string, CheerioElement?]
) {
    const $con = $(...params);
    const list: CheerioElement[] = [];
    $con.each((index, item) => {
        list.push(item);
    });
    return list;
}

type FilterProps = {
    tag?: string[];
    class_name?: string;
    attr?: { name: string; contain: string };
};

export function queryPrev(
    item: CheerioElement,
    filter?: FilterProps,
): CheerioElement {
    let prev: CheerioElement = item.prev;

    /** 过滤prev */
    if (prev.type === 'text' && prev.data === ' ') {
        return queryPrev(prev, filter);
    }
    if (filter) {
        if (filter.tag.indexOf(prev.name) === -1) {
            return queryPrev(prev, filter);
        }
    }
    return prev;
}

export function queryNext(
    item: CheerioElement,
    filter?: FilterProps,
): CheerioElement {
    let next: CheerioElement = item.next;
    if (!next) {
        return;
    }

    /** 过滤prev */
    if (next.type === 'text' && next.data === ' ') {
        return queryNext(next, filter);
    }

    if (filter) {
        if (filter.tag && filter.tag.indexOf(next.name) === -1) {
            return queryNext(next, filter);
        }

        if (filter.class_name) {
            const class_str = next.attribs.class;
            const class_arr = class_str?.split(' ');
            if (!class_arr || class_arr.indexOf(filter.class_name) === -1) {
                return queryNext(next, filter);
            }
        }

        if (filter.attr) {
            const { name, contain } = filter.attr;
            const attr = next.attribs[name];
            if (!attr && attr.indexOf(contain) === -1) {
                return queryNext(next, filter);
            }
        }
    }
    return next;
}

export function isEmpty(item: CheerioElement) {
    if (item.type === 'text' && item.data === ' ') {
        return true;
    }
    return false;
}
