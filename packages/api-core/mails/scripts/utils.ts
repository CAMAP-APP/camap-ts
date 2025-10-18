/* eslint-disable import/no-extraneous-dependencies */
import { watch } from 'chokidar';
import { copyFileSync, existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import * as glob from 'glob';
// import * as nodeSass from 'node-sass';
import * as nodeSass from 'sass';
import { dirname, join } from 'path';
import * as rimraf from 'rimraf';

export const conf = {
  SRC_DIR: join(__dirname, '../src'),
  DIST_DIR: join(__dirname, '../dist'),
};

export const clean = () => {
  rimraf.sync(conf.DIST_DIR);
};

export const runSass = (w = false) => {
  const sassGlob = `${conf.SRC_DIR}/**/*.scss`;

  const compileSass = (src: string, dest: string) => {
    mkdirSync(dirname(dest), { recursive: true });
    const { css } = nodeSass.renderSync({
      file: src,
    });
    writeFileSync(dest, css);
  };

  if (w) {
    watch(sassGlob).on('all', (event, path) => {
      const desPath = path
        .replace(conf.SRC_DIR, conf.DIST_DIR)
        .replace('.scss', '.css');
      if (event === 'add' || event === 'change') {
        compileSass(path, desPath);
      } else if (event === 'unlink') {
        unlinkSync(desPath);
      }
    });
  } else {
    glob(sassGlob, {}, (err, files) => {
      files.forEach((file) => {
        compileSass(
          file,
          file.replace(conf.SRC_DIR, conf.DIST_DIR).replace('.scss', '.css'),
        );
      });
    });
  }
};

export const copyTwigs = (w = false) => {
  const twigGlob = `${conf.SRC_DIR}/**/*.twig`;

  const stylesDir = join(conf.DIST_DIR, 'styles');
  if (!existsSync(stylesDir)) {
    mkdirSync(stylesDir, { recursive: true });
  }
  const utilsDir = join(conf.DIST_DIR, 'utils');
  if (!existsSync(utilsDir)) {
    mkdirSync(utilsDir, { recursive: true });
  }

  if (w) {
    watch(twigGlob).on('all', (event, path) => {
      const desPath = path.replace(conf.SRC_DIR, conf.DIST_DIR);
      if (event === 'add' || event === 'change') {
        copyFileSync(path, desPath);
      } else if (event === 'unlink') {
        unlinkSync(desPath);
      }
    });
  } else {
    glob(twigGlob, {}, (err, files) => {
      files.forEach((file) => {
        copyFileSync(file, file.replace(conf.SRC_DIR, conf.DIST_DIR));
      });
    });
  }
};
