import * as program from 'commander';

const bootstrap = async () => {
  program.version('0.0.1');

  // program
  //   .command('name <param>')
  //   .description('desc')
  //   .action(async (param) => {
  //     const app = await initNest({ withDefaultLogger: false });

  //     const service = app.get<SomeService>(SomeService);

  //     await service.doSomething(param);

  //     await app.close();
  //   });

  await program.parseAsync(process.argv);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
};

bootstrap();
