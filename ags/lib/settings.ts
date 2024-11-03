import GLib from "gi://GLib";

/** The folder where this program's config files are found. */
export let config_root = "";

const xdg_config_home = GLib.getenv("XDG_CONFIG_HOME");
if (xdg_config_home !== null) {
  config_root = `${xdg_config_home}/mithril-shell`;
} else {
  config_root = `${Utils.HOME}/.config/mithril-shell`;
}

/** The program configuration. */
export let config = {
  animations: {
    activeWorkspace: opt<"simple" | "smooth">("simple"),
  },
  lockCommand: opt<string | null>(null),
  minWorkspaces: opt<number>(3),
  popups: {
    volumePopup: {
      enable: opt<boolean>(true),
    },
  },
};

/**
 * Reads the program configuration from the config file and updates the configuration.
 *
 * For the sake of simplicity this expects all keys to be set in the config file (home-manager will
 * set missing keys). If no config file is found, the default configuration is used.
 */
export function readConfig() {
  try {
    const config_str = Utils.readFile(`${config_root}/settings.json`);
    if (config_str === "") {
      // Use the default config when no configuration file is found.
      print("No configuration file found.");
      return;
    }

    // The configuration should be type checked in the home-manager module, so it is not too big of
    // a deal to just do this.
    config = JSON.parse(config_str);
  } catch (e) {
    print(`Failed to read configuration: ${e}`);
    return;
  }
}

/** Helper function to define a config value with a type in a nice manner. */
function opt<T>(fallback: T): T {
  return fallback;
}
