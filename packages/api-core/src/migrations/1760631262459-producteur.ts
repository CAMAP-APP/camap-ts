import {MigrationInterface, QueryRunner} from "typeorm";

export class producteur1760631262459 implements MigrationInterface {
    name = 'producteur1760631262459'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Vendor\` ADD \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`Vendor\` ADD CONSTRAINT \`Vendor_user\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE SET NULL ON UPDATE RESTRICT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Vendor\` DROP FOREIGN KEY \`Vendor_user\``);
        await queryRunner.query(`ALTER TABLE \`Vendor\` DROP COLUMN \`userId\``);
    }

}
