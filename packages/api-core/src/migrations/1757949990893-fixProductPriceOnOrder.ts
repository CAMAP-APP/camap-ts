import {MigrationInterface, QueryRunner} from "typeorm";

export class fixProductPriceOnOrder1757949990893 implements MigrationInterface {
    name = 'fixProductPriceOnOrder1757949990893'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`UserOrder\` ADD \`quantityBase\` double NULL`);
        await queryRunner.query(`ALTER TABLE \`UserOrder\` ADD \`quantityUnitType\` tinyint UNSIGNED NULL`);
        // Populate the new fields by copying values from Product table
        await queryRunner.query(`
            UPDATE \`UserOrder\` uo
            INNER JOIN \`Product\` p ON uo.productId = p.id
            SET 
                uo.quantityBase = p.qt,
                uo.quantityUnitType = p.unitType
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`UserOrder\` DROP COLUMN \`quantityUnitType\``);
        await queryRunner.query(`ALTER TABLE \`UserOrder\` DROP COLUMN \`quantityBase\``);
    }

}
