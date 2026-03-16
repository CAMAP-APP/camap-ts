import {MigrationInterface, QueryRunner} from "typeorm";

export class EmailDigest1773221580440 implements MigrationInterface {
    name = 'EmailDigest1773221580440'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`NotificationMail\` (\`id\` int NOT NULL AUTO_INCREMENT, \`htmlBody\` mediumtext NULL, \`textBody\` mediumtext NULL, \`digest\` int NOT NULL, \`recipients\` mediumtext NULL, \`attachments\` mediumtext NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Subscription\` ADD \`cdate\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`Subscription\` ADD \`mdate\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Subscription\` DROP COLUMN \`mdate\``);
        await queryRunner.query(`ALTER TABLE \`Subscription\` DROP COLUMN \`cdate\``);
        await queryRunner.query(`DROP TABLE \`NotificationMail\``);
    }

}
