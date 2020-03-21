import * as path from 'path';
import {
    exists,
    lstatFile,
    readdir,
    rmdir,
    unlink,
    sleep,
    isEmpty,
} from './asyncUtil';

export async function rm(dir: string) {
    if (!(await exists(dir))) {
        return;
    }
    const info = await lstatFile(dir);
    if (info.isFile()) {
        await unlink(dir);
        return;
    }
    const files = await readdir(dir);
    for (const file of files) {
        const cur_path = path.resolve(dir, file);
        const cur_lstat = await lstatFile(cur_path);
        console.log(cur_path);
        if (cur_lstat.isDirectory()) {
            await rm(cur_path);
        } else {
            await unlink(cur_path);
        }
    }
    await untilEmpty(dir);
    await rmdir(dir);
}
export async function clear(dir: string) {
    if (!(await exists(dir))) {
        return;
    }
    const info = await lstatFile(dir);
    if (info.isFile()) {
        await unlink(dir);
        return;
    }
    const files = await readdir(dir);
    for (const file of files) {
        const cur_path = path.resolve(dir, file);
        const cur_lstat = await lstatFile(cur_path);
        if (cur_lstat.isDirectory()) {
            console.log;
            await rm(cur_path);
        } else {
            await unlink(cur_path);
        }
    }
}

function untilEmpty(dir: string) {
    return new Promise((resolve, reject) => {
        let i = 0;
        while (true) {
            /** 防止卡死 */
            if (i > 50) {
                return reject(`${dir} is not empty!`);
            }
            if (isEmpty(dir)) {
                return resolve(true);
            }
            sleep(0.1);
            i++;
        }
    });
}
