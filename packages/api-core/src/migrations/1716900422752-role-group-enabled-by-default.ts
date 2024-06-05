import { MigrationInterface, QueryRunner } from "typeorm";

export class roleGroupEnabledByDefault1716900422752 implements MigrationInterface {
    name = 'roleGroupEnabledByDefault1716900422752'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`VolunteerRole\` ADD \`enabledByDefault\` tinyint(1) NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`VolunteerRole\` DROP COLUMN \`enabledByDefault\``);
    }

}
