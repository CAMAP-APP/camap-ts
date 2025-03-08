import {MigrationInterface, QueryRunner} from "typeorm";

export class groupDisabled1741445966001 implements MigrationInterface {
    name = 'groupDisabled1741445966001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`GROUP\` MODIFY COLUMN \`disabled\` ENUM (\'BLOCKED_BY_ADMIN\',\'MOVED\',\'SUSPENDED\')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`GROUP\` MODIFY COLUMN \`disabled\` ENUM (\'BLOCKED_BY_ADMIN\',\'MOVED\',\'TOO_MANY_MULTI_DISTRIBS_NOT_VALIDATED\')`);
    }
}
