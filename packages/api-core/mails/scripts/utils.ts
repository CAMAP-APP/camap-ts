/* eslint-disable import/no-extraneous-dependencies */
import { watch } from 'chokidar';
import { copyFileSync, existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import * as glob from 'glob';
import * as nodeSass from 'node-sass';
import { dirname, join, basename } from 'path';
import * as rimraf from 'rimraf';

export const conf = {
  SRC_DIR: join(__dirname, '../src'),
  DIST_DIR: join(__dirname, '../dist'),
  STYLES_DIST_DIR: join(__dirname, '../dist', 'styles'),
};

export const clean = () => {
  console.log("cleaning " + conf.DIST_DIR)
  rimraf.sync(conf.DIST_DIR);
};

export const copyCss = (w = false) => {
  const cssGlob = `${conf.SRC_DIR}/**/*.css`;

  console.log("copy css " + cssGlob)
  if (w) {
    watch(cssGlob).on('all', (event, file) => {
      const dest = join(conf.STYLES_DIST_DIR, basename(file));
      if (event === 'add' || event === 'change') {
        copyFileSync(file, dest);
      } else if (event === 'unlink') {
        unlinkSync(dest);
      }
    });
  } else {
    glob(cssGlob, {}, (err, files) => {
      files.forEach((file) => {
        const dest = join(conf.STYLES_DIST_DIR, basename(file));
        console.log("copy " + file + " to " + dest)
        copyFileSync(file, dest);
      });
    });
  }
};

export const copyTwigs = (w = false) => {
  const twigGlob = `${conf.SRC_DIR}/**/*.twig`;
  console.log("copy twig " + twigGlob)

  const stylesDistDir = conf.STYLES_DIST_DIR;
  if (!existsSync(stylesDistDir)) {
    mkdirSync(stylesDistDir, { recursive: true });
  }
  const utilsDir = join(conf.DIST_DIR, 'utils');
  if (!existsSync(utilsDir)) {
    mkdirSync(utilsDir, { recursive: true });
  }

  if (w) {
    watch(twigGlob).on('all', (event, file) => {
      const desPath = join(conf.DIST_DIR, basename(file));
      if (event === 'add' || event === 'change') {
        copyFileSync(file, desPath);
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
