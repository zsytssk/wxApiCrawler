import { parseHtml } from 'parseHtml/parseHtml';

export const base_url = 'https://developers.weixin.qq.com/minigame/dev/api/';

const type = process.argv.slice(2)[0];

async function main() {
    const actions = {
        async parseHtml() {
            parseHtml(base_url);
        },
    };
    if (actions[type]) {
        await actions[type]();
    }
}

main();
