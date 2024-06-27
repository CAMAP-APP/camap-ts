import {MigrationInterface, QueryRunner} from "typeorm";

export class addCatalogFirstDistrib1719475818737 implements MigrationInterface {
    name = 'addCatalogFirstDistrib1719475818737'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Catalog\` ADD \`firstDistribId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`Catalog\` ADD CONSTRAINT \`Catalog_firstDistrib\` FOREIGN KEY (\`firstDistribId\`) REFERENCES \`MultiDistrib\`(\`id\`) ON DELETE SET NULL ON UPDATE RESTRICT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Catalog\` DROP FOREIGN KEY \`Catalog_firstDistrib\``);
        await queryRunner.query(`ALTER TABLE \`Catalog\` DROP COLUMN \`firstDistribId\``);
    }

}
