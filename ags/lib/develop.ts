export function SetupCssHotReload(dest: string) {
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
}
