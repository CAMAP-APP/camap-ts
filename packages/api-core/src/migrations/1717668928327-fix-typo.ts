import {MigrationInterface, QueryRunner} from "typeorm";

export class fixTypo1717668928327 implements MigrationInterface {
    name = 'fixTypo1717668928327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`rename table ProductDistibutionStock to ProductDistributionStock;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`rename table ProductDistributionStock to ProductDistibutionStock;`);
    }
}
