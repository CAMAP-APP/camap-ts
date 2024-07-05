import {MigrationInterface, QueryRunner} from "typeorm";

export class addDistribQuantities1720184612071 implements MigrationInterface {
    name = 'addDistribQuantities1720184612071'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Distribution\` ADD \`quantities\` int NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Distribution\` DROP COLUMN \`quantities\``);
    }

}
