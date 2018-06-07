import fetch from 'node-fetch';
import chalk from 'chalk';
import {JSDOM} from 'jsdom';
import * as M from 'moment';

import {Account} from './account';
import {getDayIndex} from '../time';

const BASE_URL = 'https://gitlab.com';

export class GitLabAccount implements Account {
  constructor(private userName: string) {}

  title = 'GitLab';
  statistic = 'contributions made';
  theme = chalk.greenBright;

  contributions: Map<number, number> = new Map();

  async getReport(day: number) {
    if (!this.contributions.has(day)) {
      try {
        const json = await (await fetch(`${BASE_URL}/users/${this.userName}/calendar.json`)).text();
        const contributions = JSON.parse(json);
        for(let day of Object.keys(contributions)){
          this.contributions.set(getDayIndex(M((day as string).trim())), parseInt(contributions[day] as string));
        }
      } catch {
        return null;
      }
    }
    return this.contributions.get(day) as number;
  }
}