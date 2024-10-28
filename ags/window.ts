import { conditionalChildren } from "lib/widgets";
import type Gtk from "types/@girs/gtk-3.0/gtk-3.0";
import type Revealer from "types/widgets/revealer";
import type { WindowProps } from "types/widgets/window";

/**
 * Padding to cover the unoccupied area of the screen when a popup window is open.
 * Closes the window when pressed.
 */
const Padding = (props: {
  name: string;
  vertical?: boolean;
  clickoff: boolean;
}) =>
  Widget.EventBox({
    vexpand: props.vertical ?? false,
    hexpand: !(props.vertical ?? false),
    setup: (w) => {
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
  name: string;
  child: Gtk.Widget;
  location: "center" | "top-left" | "top-center" | "top-right";
  popupAnimation?: typeof Revealer.prototype.transition;
  clickoff?: boolean;
  windowStyle?: string;
  windowLayer?: WindowProps["layer"];
  exclusivity?: WindowProps["exclusivity"];
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
    setup: (self) => {
      self.keybind("Escape", () => App.closeWindow("quicksettings"));
    },
    child: Widget.Box({
      children: conditionalChildren([
        pad_left
          ? Padding({
              name: props.name,
              clickoff,
            })
          : null,

        Widget.Box({
          vertical: true,
          children: conditionalChildren([
            pad_top
              ? Padding({
                  name: props.name,
                  vertical: true,
                  clickoff,
                })
              : null,

            Widget.Revealer({
              hexpand: false,
              transition: props.popupAnimation ?? "slide_down",
              transitionDuration: 150,
              child: props.child,
              setup: (self) =>
                self.hook(App, (_, wname, visible) => {
                  if (wname === props.name) self.reveal_child = visible;
                }),
            }),

            pad_bottom
              ? Padding({
                  name: props.name,
                  vertical: true,
                  clickoff,
                })
              : null,
          ]),
        }),

        pad_right
          ? Padding({
              name: props.name,
              clickoff,
            })
          : null,
      ]),
    }),
  });
};

/**
 * Opens a modal window with a configurable yes/no option. The promise will resolve when either
 * button is pressed, returning true if the yes button is pressed and false otherwise.
 */
export function showModal(settings: {
  title: string;
  description: string;
  noOption: string;
  yesOption: string;
  emphasize: "yes" | "no";
}): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const window = PopupWindow({
      name: "modal",
      location: "center",
      popupAnimation: "none",
      windowStyle: "darkened",
      clickoff: false,
      exclusivity: "ignore",
      child: Widget.Box({
        vertical: true,
        className: "modal popup",
        children: [
          Widget.Box({
            className: "content",
            vertical: true,
            hpack: "center",
            vpack: "center",
            hexpand: true,
            children: [
              Widget.Label({
                className: "title",
                hpack: "center",
                vpack: "center",
                label: settings.title,
              }),
              Widget.Label({
                className: "description",
                hpack: "center",
                vpack: "center",
                label: settings.description,
              }),
            ],
          }),
          Widget.Box({
            className: "buttons",
            homogeneous: true,
            children: [
              Widget.Button({
                className: `no-button${settings.emphasize === "no" ? " emphasize" : ""}`,
                child: Widget.Label({
                  label: settings.noOption,
                }),
                onClicked(_self) {
                  App.removeWindow("modal");
                  resolve(false);
                },
              }),
              Widget.Button({
                className: `yes-button${settings.emphasize === "yes" ? " emphasize" : ""}`,
                child: Widget.Label({
                  label: settings.yesOption,
                }),
                onClicked(_self) {
                  App.removeWindow("modal");
                  resolve(true);
                },
              }),
            ],
          }),
        ],
      }),
    });

    if (App.windows.find((w) => w.name === "modal")) {
      reject("A modal was already opened.");
      return;
    }

    App.addWindow(window);
    App.openWindow("modal");
  });
}
