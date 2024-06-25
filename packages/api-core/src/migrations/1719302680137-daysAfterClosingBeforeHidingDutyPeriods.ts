import {MigrationInterface, QueryRunner} from "typeorm";

export class daysAfterClosingBeforeHidingDutyPeriods1719302680137 implements MigrationInterface {
    name = 'daysAfterClosingBeforeHidingDutyPeriods1719302680137'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Group\` ADD \`daysAfterClosingBeforeHidingDutyPeriods\` tinyint UNSIGNED NOT NULL DEFAULT 30`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Group\` DROP COLUMN \`daysAfterClosingBeforeHidingDutyPeriods\``);
    }

}
