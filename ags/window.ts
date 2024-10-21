import Gtk from "types/@girs/gtk-3.0/gtk-3.0";

const Padding = (props: {
  name: string,
  vertical?: boolean,
}) => Widget.EventBox({
  vexpand: props.vertical ?? false,
  hexpand: !(props.vertical ?? false),
  setup: w => w.on("button-press-event", () => App.toggleWindow(props.name)),
});

export const PopupWindow = (props: {
  name: string,
  child: Gtk.Widget,
}) => Widget.Window({
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
    children: [
      Padding({
        name: props.name,
      }),
      Widget.Box({
        vertical: true,
        children: [
          Widget.Revealer({
            hexpand: false,
            transition: "slide_down",
            transitionDuration: 150,
            child: props.child,
            setup: self => self.hook(App, (_, wname, visible) => {
                if (wname === props.name)
                    self.reveal_child = visible
            }),
          }),
          Padding({
            name: props.name,
            vertical: true,
          })
        ],
      }),
    ],
  }),
});
