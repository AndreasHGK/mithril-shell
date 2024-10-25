import { conditionalChildren } from "lib/widgets";
import Gtk from "types/@girs/gtk-3.0/gtk-3.0";
import Revealer from "types/widgets/revealer";

/**
 * Padding to cover the unoccupied area of the screen when a popup window is open.
 * Closes the window when pressed.
 */
const Padding = (props: {
  name: string,
  vertical?: boolean,
}) => Widget.EventBox({
  vexpand: props.vertical ?? false,
  hexpand: !(props.vertical ?? false),
  setup: w => w.on("button-press-event", () => App.toggleWindow(props.name)),
});

/**
 * A generic popup window builder.
 *
 * @param location - Where on the screen the popup should appear.
 * @param popupAnimation - What animation to use for opening the popup window.
 */
export const PopupWindow = (props: {
  name: string,
  child: Gtk.Widget,
  location: "center" | "top-left" | "top-center" | "top-right",
  popupAnimation?: typeof Revealer.prototype.transition,
}) => {
  const pad_bottom = ["center", "top-left", "top-center", "top-right"].includes(props.location);
  const pad_right = ["center", "top-left", "top-center"].includes(props.location);
  const pad_left = ["center", "top-center", "top-right"].includes(props.location);
  const pad_top = ["center"].includes(props.location);

  return Widget.Window({
    visible: false,
    name: props.name,
    anchor: ["top", "bottom", "right", "left"],
    layer: "top",
    exclusivity: "exclusive",
    keymode: "on-demand",
    setup: self => {
      self.keybind("Escape", () => App.closeWindow("quicksettings"));
    },
    child: Widget.Box({
      children: conditionalChildren([
        pad_left ? Padding({
          name: props.name,
        }) : null,

        Widget.Box({
          vertical: true,
          children: conditionalChildren([
            pad_top ? Padding({
              name: props.name,
              vertical: true,
            }) : null,

            Widget.Revealer({
              hexpand: false,
              transition: props.popupAnimation ?? "slide_down",
              transitionDuration: 150,
              child: props.child,
              setup: self => self.hook(App, (_, wname, visible) => {
                if (wname === props.name)
                  self.reveal_child = visible
              }),
            }),

            pad_bottom ? Padding({
              name: props.name,
              vertical: true,
            }) : null,
          ]),
        }),

        pad_right ? Padding({
          name: props.name,
        }) : null,
      ]),
    }),
  });
};
