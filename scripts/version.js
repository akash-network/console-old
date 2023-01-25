const { exec } = require('child_process');

function debug(args) {
  console.log(args);
  return args;
}

function asyncMap(fn) {
  return (xs) => Promise.all(xs.map(fn));
}

function getWorkspaceDirs() {
  return Promise.resolve(['web', 'proxy']);
}

function bumpPackagePatch(dir) {
  console.log(`Bumping package version for ${dir}...`);

  return new Promise((resolve, reject) => {
    exec(
      `yarn workspace ${dir} version --patch --no-git-tag-version`,
      (err, stdout) => {
        if (err) reject(err);
        resolve(stdout);
      }
    );
  });
}

getWorkspaceDirs().then(asyncMap(bumpPackagePatch)).then(debug);
