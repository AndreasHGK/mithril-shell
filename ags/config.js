const entry = `${App.configDir}/main.ts`;
const dest = "/tmp/mithril-shell";

function mkdir(dir) {
  Utils.subprocess(["mkdir", "-p", dir]);
}

async function compileStyles(dest) {
  const scss = `${App.configDir}/style.scss`;
  const css = `${dest}/style.css`;

  await Utils.execAsync(`sassc ${scss} ${css}`);
}

async function compileMain(dest) {
  await Utils.execAsync([
    "bun",
    "build",
    entry,
    "--outfile",
    `${dest}/main.js`,
    "--external",
    "resource://*",
    "--external",
    "gi://*",
    "--external",
    "file://*",
  ]);
}

(async () => {
  try {
    // Ensure the destination directory exists.
    mkdir(dest);
    await compileStyles(dest);
    await compileMain(dest);

    // Set up hot reloading of styles.
    Utils.monitorFile(`${App.configDir}/style.scss`, (_, event) => {
      if (event !== 0) {
        // Not a changed event.
        return;
      }

      print("Hot reloading styles.");
      Promise.resolve(compileStyles(dest))
        .then((_) => {
          App.resetCss();
          App.applyCss(`${dest}/style.css`);
        })
        .catch((reason) => {
          print(`Hot reloading error: ${reason}`);
        });
    });

    (await import(`file://${dest}/main.js`)).main(dest);
  } catch (err) {
    console.error(err);
    App.quit();
  }
})();
