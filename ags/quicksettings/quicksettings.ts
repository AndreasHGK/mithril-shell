import Gtk from "gi://Gtk?version=3.0";
import { Icon } from "lib/types";
import { Binding } from "types/service";

const audio = await Service.import("audio");
const battery = await Service.import("battery");
const bluetooth = await Service.import("bluetooth");
const network = await Service.import("network");

// Constructor for the top buttons in the quicksettings menu.
const Button = (props: {
  on_click?: () => void,
  icon: Icon,
  label?: string | Binding<any, any, string>,
}) => {
  const children: any[] = [
    Widget.Icon({
      icon: props.icon,
    }),
  ];

  if (props.label) {
    children.push(Widget.Label({
      label: props.label,
    }));
  }

  return Widget.Button({
    on_clicked: props.on_click ?? (() => { }),
    className: "indicator",
    child: Widget.Box({
      children,
    })
  });
};

// A quicksettings slider element constructor.
const Slider = (props: {
  icon: Icon,
  min: number,
  max: number,
  value?: number | Binding<any, any, number>,
  on_change?: (value: { value: number }) => void,
}) => Widget.Box({
  vertical: false,
  className: "slider",
  hexpand: true,
  children: [
    Widget.Icon({
      size: 16,
      icon: props.icon,
    }),
    Widget.Slider({
      draw_value: false,
      hexpand: true,
      value: props.value ?? 0,
      min: props.min,
      max: props.max,
      on_change: props.on_change ?? ((_value) => { }),
    }),
  ],
});

// Big pill shaped buttons arranged in a grid in the quicksettings menu.
const PillButton = (props: {
  icon: Icon,
  // Main label of the button displaying what the button is for.
  label: string | Binding<any, any, string>,
  // Optional text under the main label providing extra info about the state of the system that the
  // button controls. An example is showing the current connected Wi-Fi network SSID.
  subtext?: Binding<any, any, string | null>,
  active: boolean | Binding<any, any, boolean>,
  onToggled: (event: { active: boolean }) => void,
}) => {
  const main_label = Widget.Label({
    hpack: "start",
    label: props.label,
    ellipsize: 3,
  });
  const labels = props.subtext === undefined ? [main_label] : props.subtext.as(subtext => {
    const children = [
      main_label
    ];

    if (subtext) {
      children.push(
        Widget.Label({
          hpack: "start",
          className: "subtext",
          label: subtext,
          ellipsize: 3,
        })
      );
    }

    return children;
  });

  return Widget.ToggleButton({
    className: "pill-button",
    hexpand: false,
    active: props.active,
    onToggled: props.onToggled,
    child: Widget.Box({
      vertical: false,
      children: [
        Widget.Icon({
          size: 18,
          icon: props.icon,
        }),
        Widget.Box({
          vertical: true,
          vexpand: true,
          vpack: "center",
          children: labels,
        }),
      ],
    }),
  });
};

export const Quicksettings = () => Widget.Window({
  visible: false,
  name: "quicksettings",
  anchor: ['top', 'right'],
  layer: "top",
  exclusivity: "exclusive",
  setup: self => {
    self.keybind("Escape", () => App.closeWindow("quicksettings"));
  },
  child: Widget.Box({
    className: "quicksettings",
    vertical: true,
    children: [
      Widget.CenterBox({
        className: "indicators",
        vertical: false,
        start_widget: Widget.Box({
          hpack: "start",
          children: [
            Button({
              icon: battery.bind("icon_name"),
              label: battery.bind("percent").as(percent => ` ${percent}%`),
              on_click() {
                Utils.execAsync(`bash -c "XDG_CURRENT_DESKTOP=gnome gnome-control-center power"`);
              },
            })
          ],
        }),
        end_widget: Widget.Box({
          hpack: "end",
          children: [
            Button({
              icon: "applets-screenshooter-symbolic",
            }),
            Button({
              icon: "settings-symbolic",
              on_click() {
                Utils.execAsync(`bash -c "XDG_CURRENT_DESKTOP=gnome gnome-control-center"`);
              },
            }),
            Button({
              icon: "system-lock-screen-symbolic",
            }),
            Button({
              icon: "system-shutdown-symbolic",
            }),
          ],
        }),
      }),

      Slider({
        value: audio.speaker.bind("volume"),
        icon: "audio-volume-high-symbolic",
        min: 0,
        max: 1,
        on_change: ({ value }) => {
          audio.speaker.volume = value;
        },
      }),
      Slider({
        value: audio.microphone.bind("volume"),
        icon: "audio-input-microphone-symbolic",
        min: 0,
        max: 1,
        on_change: ({ value }) => {
          audio.microphone.volume = value;
        },
      }),

      Widget.FlowBox({
        className: "pill-buttons",
        setup(self) {
          // Ensure the children have the same size.
          self.homogeneous = true;
          self.hexpand = true;
          self.min_children_per_line = 2;
          self.max_children_per_line = 2;
          self.row_spacing = 12;
          self.column_spacing = 12;
          self.add(
            PillButton({
              icon: network.wifi.bind('icon_name'),
              label: "Wi-Fi",
              subtext: Utils.merge(
                [network.wifi.bind("internet"), network.wifi.bind("ssid")],
                (state, ssid) => {
                  if (state === "disconnected") {
                    return null;
                  }
                  if (state === "connecting") {
                    return "connecting...";
                  }

                  return ssid;
                },
              ),
              active: network.bind("wifi").as(wifi => wifi.enabled),
              onToggled({ active }) {
                if (network.wifi.enabled == active) {
                  return;
                }
                network.wifi.enabled = active;
              },
            }),
          );
          self.add(
            PillButton({
              icon: bluetooth
                .bind("enabled")
                .as(enabled => enabled ? "bluetooth-active-symbolic" : "bluetooth-disabled-symbolic"),
              label: "Bluetooth",
              subtext: bluetooth.bind("connected_devices").as(devices => {
                if (devices.length === 0) {
                  return null;
                }
                if (devices.length === 1) {
                  return devices[0].name;
                }

                return `${devices.length} devices`;
              }),
              active: bluetooth.bind("enabled"),
              onToggled({ active }) {
                if (bluetooth.enabled == active) {
                  return;
                }
                bluetooth.enabled = active;
              },
            }),
          );
          self.add(
            PillButton({
              icon: "display-brightness-symbolic",
              label: "Room Lights",
              active: false,
              onToggled(event) { },
            }),
          );
          self.add(
            PillButton({
              icon: "night-light-symbolic",
              label: "Night Light",
              active: false,
              onToggled(event) { },
            }),
          );
        },
      })
    ],
  }),
});
