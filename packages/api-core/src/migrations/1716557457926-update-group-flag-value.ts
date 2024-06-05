import { MigrationInterface, QueryRunner } from "typeorm";

export class updateGroupFlagValue1716557457926 implements MigrationInterface {
    name = 'updateGroupFlagValue1716557457926'

    public async up(queryRunner: QueryRunner): Promise<void> {
			await queryRunner.query(`UPDATE \`Group\` SET flags = flags + CONV('01100000000000', 2, 10)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
			await queryRunner.query(`UPDATE \`Group\` SET flags = flags - CONV('01100000000000', 2, 10)`);

    }

}
