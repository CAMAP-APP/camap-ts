import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MailsService } from '../mails.service';

@UseGuards(AuthGuard('bridge'))
@Controller('bridge/mail')
export class MailBridgeController {
  constructor(private readonly mailsService: MailsService) {}

  @Get('getUnsentMails')
  async getUnsentMails() {
    return this.mailsService.getUnsentMails();
  }
}
