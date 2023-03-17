import {
  Controller,
  Get,
  Injectable,
  Param,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import * as faker from 'faker';
import { readdirSync } from 'fs';
import { join } from 'path';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { VariableService } from '../../tools/variable.service';
import { UserEntity } from '../../users/models/user.entity';
import { MailsService } from '../mails.service';

/**
  newVendorInvitation : http://localhost:3010/mails/get/newVendorInvitation.twig/%7B%22groupName%22:%22Les%20locavores%20affam%C3%A9s%22,%22groupId%22:1,%22invationSenderName%22:%22Jean-Michel%20LEDEV%22,%22invitationSenderPhone%22:%220656457856%22,%22invitationSenderEmail%22:%22jeanmi@camap.net%22,%22invitationSenderId%22:3,%22distributionDaysAndTime%22:%22Tous%20les%20jeudis%20de%2016h%20%C3%A0%2018h%22,%22placeAddress%22:%22Poupougnac%20(33200)%22,%22message%22:%22Merci%20de%20rejoindre%20mon%20groupe%20Camap%22%7D
  existingVendorInvitation : http://localhost:3010/mails/get/existingVendorInvitation.twig/%7B%22groupName%22:%22Les%20locavores%20affam%C3%A9s%22,%22groupId%22:1,%22invationSenderName%22:%22Jean-Michel%20LEDEV%22,%22invitationSenderPhone%22:%220656457856%22,%22invitationSenderEmail%22:%22jeanmi@camap.net%22,%22invitationSenderId%22:3,%22distributionDaysAndTime%22:%22Tous%20les%20jeudis%20de%2016h%20%C3%A0%2018h%22,%22placeAddress%22:%22Poupougnac%20(33200)%22,%22message%22:%22Merci%20de%20rejoindre%20mon%20groupe%20Camap%22%7D
  accountCreatedByOther : http://localhost:3010/mails/get/accountCreatedByOther.twig/%7B%22groupName%22:%22Les%20locavores%20affam%C3%A9s%22,%22senderName%22:%22Jean-Michel%20LEDEV%22,%22recipientName%22:%22Corentin%22,%22link%22:%22www.camap.net%22%7D
*/

/**
 * Mail controller
 */
@Injectable()
@UseGuards(GqlAuthGuard)
@Controller('mails')
export class MailsController {
  constructor(
    private readonly mailsService: MailsService,
    private readonly variableService: VariableService,
  ) {}

  @Get('get/:templateName/:params')
  async getMail(
    @Param('templateName') templateName: string,
    @Param('params') params: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    if (!currentUser.isSuperAdmin()) {
      throw new UnauthorizedException();
    }

    const templateParams: Record<string, any> = JSON.parse(params);
    if (templateName === 'message.twig' && !('text' in templateParams)) {
      templateParams.text = faker.lorem.sentences(10);
    }
    if (!('groupName' in templateParams)) {
      templateParams.groupName = faker.company.companyName();
    }

    if (process.env.THEME_ID !== 'default') {
      const theme = await this.variableService.getTheme();
      templateParams.theme = theme;
    }

    const templatedHtml = await this.mailsService.renderTwing(
      templateName,
      templateParams,
    );

    return templatedHtml;
  }

  @Get('list')
  async list(@CurrentUser() currentUser: UserEntity) {
    if (!currentUser.isSuperAdmin()) {
      throw new UnauthorizedException();
    }

    const directoryPath = join(__dirname, '../../../mails/dist');
    const files = readdirSync(directoryPath);
    return (
      '<h1>E-mails : </h1><ul>' +
      files
        .filter((f) => f.endsWith('.twig'))
        .map(
          (f) =>
            `<li><a href="${process.env.FRONT_URL}/mails/get/${f}/%7B%7D">${f}</a></li>`,
        )
        .join('') +
      '</ul>'
    );
  }
}
