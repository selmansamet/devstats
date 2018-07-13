import fetch from 'node-fetch';
import chalk from 'chalk';
import * as M from 'moment';

import {Account} from './account';
import {getDayIndex} from '../time';

const BASE_URL = 'https://hackerrank.com';

export class HackerRankAccount implements Account {
  constructor(private userName: string) {}

  title = 'HackerRank';
  statistic = 'submissions';
  theme = chalk.hex('#23b355');

  contributions: Map<number, number> = new Map();

  async getReport(day: number) {
    if (!this.contributions.has(day)) {
      try {
        const contributions = await (await fetch(`${BASE_URL}/rest/hackers/${this.userName}/submission_histories`)).json();
        for (const contributionDate of Object.keys(contributions)) {
          const contributionDay = getDayIndex(M(contributionDate));
          this.contributions.set(contributionDay, parseInt(contributions[contributionDate]));
        }
        if (!this.contributions.has(day)) {
          this.contributions.set(day, 0);
        }
      } catch {
        return null;
      }
    }

    return this.contributions.get(day) as number;
  }
}
