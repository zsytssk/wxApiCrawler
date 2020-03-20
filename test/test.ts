import { base_url } from '../src/main';
import { parseUrl } from '../src/parseHtml/parseHtml';
import { isEmpty } from '../src/parseHtml/query';

async function main() {
    const $ = await parseUrl(base_url);
    const con = $('#docContent .content')[0];
    for (const item of con.childNodes) {
        if (isEmpty(item)) {
            continue;
        }
        console.log(item.tagName);
    }
}
main();
