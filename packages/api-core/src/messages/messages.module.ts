import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from '../entities/message.entity';
import { MailsModule } from '../mails/mails.module';
import { UsersModule } from '../users/users.module';
import { MessagesResolver } from './messages.resolver';
import { MessagesService } from './messages.service';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [
    MailsModule,
    UsersModule,
    GroupsModule,
    TypeOrmModule.forFeature([MessageEntity]),
  ],
  providers: [MessagesService, MessagesResolver],
})
export class MessagesModule {}
