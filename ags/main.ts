import Gdk from "gi://Gdk";
import type Gtk from "gi://Gtk?version=3.0";

import { Bar } from "./bar/bar.js";
import { Quicksettings } from "./quicksettings/quicksettings.js";

function forMonitors(widget: (monitor: number) => Gtk.Window) {
  const n = Gdk.Display.get_default()?.get_n_monitors() || 1;
  return Array.from({ length: n }, (_, i) => i).flatMap(widget);
}

export function main(dest: string): void {
  App.config({
    style: `${dest}/style.css`,
    windows: [...forMonitors(Bar), Quicksettings()],
  });
}
