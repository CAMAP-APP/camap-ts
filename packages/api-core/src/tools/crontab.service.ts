import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
var os = require('os');

/**
 * Calls crons on haxe/neko app
 * 
 * * * * * * cd /var/vhosts/appcamap/app.camap.net/www/ && /usr/local/bin/neko index.n cron/minute >> /dev/null 2>&1
 0 * * * * cd /var/vhosts/appcamap/app.camap.net/www/ && /usr/local/bin/neko index.n cron/hour >> /dev/null 2>&1
15 0 * * * cd /var/vhosts/appcamap/app.camap.net/www/ && /usr/local/bin/neko index.n cron/daily >> /dev/null 2>&1
 */
@Injectable()
export class CrontabService {
  @Cron(CronExpression.EVERY_MINUTE)
  minutely() {
    if (!process.env.HX_TRIGGER_CRONS) return;
    console.log(`CrontabService : calling  ${this.getCamapHaxeUrl()}/cron/minute`);
    axios
      .get(`${this.getCamapHaxeUrl()}/cron/minute`)
      .then((res) => {
        console.log('CrontabService Ok : ' + res.statusText);
      })
      .catch((error) => {
        console.log('CrontabService Error : ' + error.message);
      });
  }

  @Cron(CronExpression.EVERY_HOUR)
  hourly() {
    if (!process.env.HX_TRIGGER_CRONS) return;
    console.log(`CrontabService : calling  ${this.getCamapHaxeUrl()}/cron/hour`);
    axios
      .get(`${this.getCamapHaxeUrl()}/cron/hour`)
      .then((res) => {
        console.log('CrontabService Ok : ' + res.statusText);
      })
      .catch((error) => {
        console.log('CrontabService Error : ' + error.message);
      });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  daily() {
    if (!process.env.HX_TRIGGER_CRONS) return;
    console.log(`CrontabService : calling  ${this.getCamapHaxeUrl()}/cron/daily`);
    axios
      .get(`${this.getCamapHaxeUrl()}/cron/daily`)
      .then((res) => {
        console.log('CrontabService Ok : ' + res.statusText);
      })
      .catch((error) => {
        console.log('CrontabService Error : ' + error.message);
      });
  }

  getCamapHaxeUrl(): string {
    // To test it locally use your local IP address
    // return 'http://192.168.0.1';
    return process.env.CAMAP_HOST;
  }
}
