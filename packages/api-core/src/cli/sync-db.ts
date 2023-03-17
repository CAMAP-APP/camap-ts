import { getConnectionOptions, createConnection } from 'typeorm';

(async () => {
  const options = await getConnectionOptions();
  const connection = await createConnection({
    ...options,
    synchronize: true,
    entities: [
      (options.entities[0] as string).replace(
        'src/**/*.entity.ts',
        'dist/**/*.entity.js',
      ),
    ],
  });
  await connection.close();
})();
