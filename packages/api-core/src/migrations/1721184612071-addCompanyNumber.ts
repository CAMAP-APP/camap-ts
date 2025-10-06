import {MigrationInterface, QueryRunner} from "typeorm";

export class addCompanyNumber1721184612071 implements MigrationInterface {
    name = 'addCompanyNumber1721184612071'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Vendor\` ADD \`companyNumber\` varchar(64) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Vendor\` DROP COLUMN \`companyNumber\``);
    }

}
