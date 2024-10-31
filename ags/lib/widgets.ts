import type Gtk from "gi://Gtk?version=3.0";
import { Binding } from "types/service";

/** Return only the children that are not equal to null. */
export function conditionalChildren(children: (Gtk.Widget | null)[]): Gtk.Widget[] {
  return children.filter((child) => child !== null);
}
