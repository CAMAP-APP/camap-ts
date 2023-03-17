import { Controller, Get, Injectable } from '@nestjs/common';

@Injectable()
@Controller('')
export class ToolsController {
  constructor() {}

  /**
   * health endpoint for k8s
   */
  @Get('health')
  async health() {
    return { version: process.env.VERSION ? process.env.VERSION : 0 };
  }

  /**
   * ping endpoint for k8s
   */
  @Get('ping')
  ping() {
    return { version: process.env.VERSION ? process.env.VERSION : 0 };
  }
}
