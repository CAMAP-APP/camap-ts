import {MigrationInterface, QueryRunner} from "typeorm";

export class EmailDigests1773912252829 implements MigrationInterface {
    name = 'EmailDigests1773912252829'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`NotificationMail\` (\`id\` int NOT NULL AUTO_INCREMENT, \`cdate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`htmlBody\` mediumtext NULL, \`textBody\` mediumtext NULL, \`digest\` int NOT NULL, \`subject\` varchar(256) NOT NULL, \`groupId\` int NOT NULL, \`recipientId\` int NOT NULL, \`attachments\` mediumtext NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`NotificationMail\``);
    }

}
