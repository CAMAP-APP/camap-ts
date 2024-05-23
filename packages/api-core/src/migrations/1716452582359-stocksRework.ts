import {MigrationInterface, QueryRunner} from "typeorm";

export class stocksRework1716452582359 implements MigrationInterface {
    name = 'stocksRework1716452582359'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`ProductDistibutionStock\` (\`id\` int NOT NULL AUTO_INCREMENT, \`stockPerDistribution\` float UNSIGNED NOT NULL DEFAULT '0', \`frequencyRatio\` tinyint UNSIGNED NOT NULL DEFAULT '1', \`productId\` int NOT NULL, \`startDistributionId\` int NOT NULL, \`endDistributionId\` int NOT NULL, INDEX \`ProductDistibutionStock_endDistributionId\` (\`endDistributionId\`), INDEX \`ProductDistibutionStock_startDistributionId\` (\`startDistributionId\`), INDEX \`ProductDistibutionStock_productId\` (\`productId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Product\` ADD \`stockTracking\` tinyint UNSIGNED NULL`);
        await queryRunner.query(`ALTER TABLE \`Product\` ADD \`stockTrackingPerDistrib\` tinyint UNSIGNED NULL`);
        await queryRunner.query(`ALTER TABLE \`ProductDistibutionStock\` ADD CONSTRAINT \`ProductDistibutionStock_product\` FOREIGN KEY (\`productId\`) REFERENCES \`Product\`(\`id\`) ON DELETE CASCADE ON UPDATE RESTRICT`);
        await queryRunner.query(`ALTER TABLE \`ProductDistibutionStock\` ADD CONSTRAINT \`ProductDistibutionStock_startDistribution\` FOREIGN KEY (\`startDistributionId\`) REFERENCES \`Distribution\`(\`id\`) ON DELETE CASCADE ON UPDATE RESTRICT`);
        await queryRunner.query(`ALTER TABLE \`ProductDistibutionStock\` ADD CONSTRAINT \`ProductDistibutionStock_endDistribution\` FOREIGN KEY (\`endDistributionId\`) REFERENCES \`Distribution\`(\`id\`) ON DELETE CASCADE ON UPDATE RESTRICT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ProductDistibutionStock\` DROP FOREIGN KEY \`ProductDistibutionStock_endDistribution\``);
        await queryRunner.query(`ALTER TABLE \`ProductDistibutionStock\` DROP FOREIGN KEY \`ProductDistibutionStock_startDistribution\``);
        await queryRunner.query(`ALTER TABLE \`ProductDistibutionStock\` DROP FOREIGN KEY \`ProductDistibutionStock_product\``);
        await queryRunner.query(`ALTER TABLE \`Product\` DROP COLUMN \`stockTrackingPerDistrib\``);
        await queryRunner.query(`ALTER TABLE \`Product\` DROP COLUMN \`stockTracking\``);
        await queryRunner.query(`DROP INDEX \`ProductDistibutionStock_productId\` ON \`ProductDistibutionStock\``);
        await queryRunner.query(`DROP INDEX \`ProductDistibutionStock_startDistributionId\` ON \`ProductDistibutionStock\``);
        await queryRunner.query(`DROP INDEX \`ProductDistibutionStock_endDistributionId\` ON \`ProductDistibutionStock\``);
        await queryRunner.query(`DROP TABLE \`ProductDistibutionStock\``);
    }

}
