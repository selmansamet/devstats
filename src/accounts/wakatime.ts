import * as os from 'os';
import * as fs from 'fs-extra';
import * as path from 'path';

import {stringify as querify} from 'query-string';
import fetch from 'node-fetch';
import * as M from 'moment';
import chalk from 'chalk';

import {Account} from './account';
import {parseDayIndex} from '../time';

const BASE_URL = 'https://wakatime.com/api/v1';

interface Response {
  data: {
    grand_total: {
      total_seconds: number;
    };
  }[];
}

const formatMoment = (moment: M.Moment) => moment.format('YYYY-MM-DD');

export class WakaTimeAccount implements Account {
  constructor(private userName: string) {}

  title = 'WakaTime';
  statistic = 'spent coding';
  theme = chalk.hex('#2595ff');

  apiKey: string | null | undefined;
  durations: Map<number, string> = new Map();

  async getReport(day: number) {
    if (this.durations.has(day)) {
      return this.durations.get(day) as string;
    }

    this.apiKey = await this.findApiKey();
    if (!this.apiKey) {
      return null;
    }

    const dayMoment = parseDayIndex(day);
    const url = `${BASE_URL}/users/${this.userName}/summaries?` + querify({
      start: formatMoment(dayMoment),
      end: formatMoment(dayMoment.add(1, 'day')),
      api_key: this.apiKey
    });
    try {
      const response: Response = (await (await fetch(url)).json());
      const seconds = response.data[0].grand_total.total_seconds;
      const duration = seconds > 0 ? M.duration(seconds, 'seconds').humanize() : 'no time';
      this.durations.set(day, duration);

      return duration;
    } catch {
      // `null` will be returned below
    }

    return null;
  }

  async findApiKey() {
    try {
      const cfgPath = path.join(os.homedir(), '.wakatime.cfg');
      const cfgContent = await fs.readFile(cfgPath, 'utf8');
      const match = cfgContent.match(/api_key ?= ?(.+)/);

      if (match && match[1]) {
        return match[1];
      }
    } catch {
      return null;
    }
  }
}
