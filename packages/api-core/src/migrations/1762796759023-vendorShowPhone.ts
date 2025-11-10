import {MigrationInterface, QueryRunner} from "typeorm";

export class vendorShowPhone1762796759023 implements MigrationInterface {
    name = 'vendorShowPhone1762796759023'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Vendor\` ADD \`showPhone\` tinyint NOT NULL DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Vendor\` DROP COLUMN \`showPhone\``);
    }

}
