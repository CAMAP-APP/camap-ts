import {MigrationInterface, QueryRunner} from "typeorm";

export class EmailDigests1773758907826 implements MigrationInterface {
    name = 'EmailDigests1773758907826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`NotificationMail\` (\`id\` int NOT NULL AUTO_INCREMENT, \`cdate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`htmlBody\` mediumtext NULL, \`textBody\` mediumtext NULL, \`digest\` int NOT NULL, \`subject\` varchar(256) NOT NULL, \`groupId\` int NOT NULL, \`attachments\` mediumtext NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Subscription\` ADD \`cdate\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`Subscription\` ADD \`mdate\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Subscription\` DROP COLUMN \`mdate\``);
        await queryRunner.query(`ALTER TABLE \`Subscription\` DROP COLUMN \`cdate\``);
        await queryRunner.query(`DROP TABLE \`NotificationMail\``);
    }

}
