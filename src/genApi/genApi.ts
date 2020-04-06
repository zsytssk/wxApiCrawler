import { ApiBase } from 'api';
import { api_map, orgApi } from './organize';
import { writeApiEnd, writeApiIn } from './writeApi';

export async function genApi(item_api: ApiBase) {
    await orgApi(item_api);
}

export async function writeApi() {
    for (const [key, item] of Object.entries(api_map)) {
        console.log(key, item.name);
        await writeApiIn(item);
    }
    await writeApiEnd();
}
