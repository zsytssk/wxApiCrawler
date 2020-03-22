import { genApi, writeApi } from 'genApi/genApi';
import { parseHtml } from 'parseHtml/parseHtml';
import { clearDist } from 'utils/utils';

export const base_url = 'https://developers.weixin.qq.com/minigame/dev/api/';

const type = process.argv.slice(2)[0];

async function main() {
    const actions = {
        async parseHtml() {
            clearDist();
            await parseHtml(base_url, genApi);
            await writeApi();
        },
    };
    if (actions[type]) {
        await actions[type]();
    }
}

main();
