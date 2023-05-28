/* eslint-disable no-console */
import chalk from "chalk";
import { DateTime } from "luxon";

let DEV = false;

if (process.env.DEV) {
    DEV = process.env.DEV == "true" || process.env.DEV == "0";
}

export function log(...args: string[]) {
    if (DEV) {
        const date = DateTime.now().toFormat("[dd.LL.yyyy - hh.mm.ss]");
        console.log(chalk.grey(date) + chalk.bgGray("DEBUG"), args.join());
    }
}

export default DEV;