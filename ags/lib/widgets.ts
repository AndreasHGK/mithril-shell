import Gtk from "gi://Gtk?version=3.0";
import { Binding } from "types/service";

type DynamicChild = {
  widget: Gtk.Widget,
  visible?: Binding<any, any, boolean>,
};

/** Dynamically filter children in a list based on certain conditions. */
export function dynamicChildren(children: DynamicChild[]) : Binding<any, any, Gtk.Widget[]> {
  return Utils.merge(
    children.map(val => (val.visible ?? Variable(true).bind()).as(visible => visible ? val.widget : null)),
    (...children: Gtk.Widget[]) => {
      return children.filter(child => child !== null);
    }
  );
}
