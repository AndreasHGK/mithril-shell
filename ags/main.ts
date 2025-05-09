import Gdk from "gi://Gdk";
import type Gtk from "gi://Gtk?version=3.0";

import { VolumePopup } from "osd-popup/osd-popup.js";
import { Bar } from "./bar/bar.js";
import { config, readConfig } from "./lib/settings.js";
import { Quicksettings } from "./quicksettings/quicksettings.js";

function forMonitors(widget: (monitor: number) => Gtk.Window) {
  const n = Gdk.Display.get_default()?.get_n_monitors() || 1;
  return Array.from({ length: n }, (_, i) => i).flatMap(widget);
}

export function main(dest: string): void {
  readConfig();
  App.config({
    style: `${dest}/style.css`,
    windows: () => {
      const windows = [...forMonitors(Bar), Quicksettings()];

      if (config.popups?.volumePopup?.enable) {
        windows.push(VolumePopup());
      }

      return windows;
    },
    maxStreamVolume: 1.1,
  });
}
