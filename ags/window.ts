import { conditionalChildren } from "lib/widgets";
import Gtk from "types/@girs/gtk-3.0/gtk-3.0";
import Revealer from "types/widgets/revealer";
import { type WindowProps } from "types/widgets/window"

/**
 * Padding to cover the unoccupied area of the screen when a popup window is open.
 * Closes the window when pressed.
 */
const Padding = (props: {
  name: string,
  vertical?: boolean,
  clickoff: boolean,
}) => Widget.EventBox({
  vexpand: props.vertical ?? false,
  hexpand: !(props.vertical ?? false),
  setup: w => {
    if (props.clickoff) {
      w.on("button-press-event", () => App.toggleWindow(props.name));
    }
  },
});

/**
 * A generic popup window builder.
 *
 * @param location - Where on the screen the popup should appear.
 * @param popupAnimation - What animation to use for opening the popup window. Defaults to
 * "slide_down".
 */
export const PopupWindow = (props: {
  name: string,
  child: Gtk.Widget,
  location: "center" | "top-left" | "top-center" | "top-right",
  popupAnimation?: typeof Revealer.prototype.transition,
  clickoff?: boolean,
  windowStyle?: string,
  windowLayer?: WindowProps["layer"],
  exclusivity?: WindowProps["exclusivity"],
}) => {
  const clickoff = props.clickoff ?? true;
  
  const pad_bottom = ["center", "top-left", "top-center", "top-right"].includes(props.location);
  const pad_right = ["center", "top-left", "top-center"].includes(props.location);
  const pad_left = ["center", "top-center", "top-right"].includes(props.location);
  const pad_top = ["center"].includes(props.location);

  return Widget.Window({
    className: props.windowStyle ?? "",
    visible: false,
    name: props.name,
    anchor: ["top", "bottom", "right", "left"],
    layer: props.windowLayer ?? "top",
    exclusivity: props.exclusivity ?? "exclusive",
    keymode: "on-demand",
    setup: self => {
      self.keybind("Escape", () => App.closeWindow("quicksettings"));
    },
    child: Widget.Box({
      children: conditionalChildren([
        pad_left ? Padding({
          name: props.name,
          clickoff,
        }) : null,

        Widget.Box({
          vertical: true,
          children: conditionalChildren([
            pad_top ? Padding({
              name: props.name,
              vertical: true,
              clickoff,
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
              clickoff,
            }) : null,
          ]),
        }),

        pad_right ? Padding({
          name: props.name,
          clickoff,
        }) : null,
      ]),
    }),
  });
};
