import { ApiBase } from 'api';
import { orgApi, api_map } from './organize';
import { writeApiEnd, writeApiIn } from './writeApi';

export async function genApi(item_api: ApiBase) {
    await orgApi(item_api);
}

export async function writeApi() {
    console.log(api_map);
    for (const [key, item] of Object.entries(api_map)) {
        console.log(key, item.name);
        await writeApiIn(item);
    }
    await writeApiEnd();
}
