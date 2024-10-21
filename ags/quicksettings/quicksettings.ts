import Gtk from "gi://Gtk?version=3.0";
import { Icon } from "lib/types";
import { FlowBoxChild } from "types/@girs/gtk-3.0/gtk-3.0.cjs";
import { Binding } from "types/service";
import { PopupWindow } from "window";
import night_light from "services/night-light";

const audio = await Service.import("audio");
const battery = await Service.import("battery");
const bluetooth = await Service.import("bluetooth");
const hyprland = await Service.import("hyprland");
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
    className: "button",
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
const ToggleButton = (props: {
  icon: Icon,
  // Main label of the button displaying what the button is for.
  label: string | Binding<any, any, string>,
  // Optional text under the main label providing extra info about the state of the system that the
  // button controls. An example is showing the current connected Wi-Fi network SSID.
  subtext?: Binding<any, any, string | null>,
  active: boolean | Binding<any, any, boolean>,
  onToggled: (event: { active: boolean }) => void,
  onSubmenu?: () => void,
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

  return Widget.Box({
    setup(self) {
      if (props.onSubmenu !== undefined) {
        self.add(
          Widget.Button({
            className: "chevron",
            child: Widget.Icon({
              size: 15,
              icon: "go-next-symbolic",
            }),
            onClicked() {
              // Typescript is unhappy without the cast.
              (props as any).onSubmenu();
            },
          }),
        );
      }
    },
    hexpand: false,
    vexpand: false,
    children: [
      Widget.ToggleButton({
        className: "toggle-button",
        hexpand: true,
        active: props.active,
        onToggled: props.onToggled,
        child: Widget.Box({
          vertical: false,
          children: [
            Widget.Box({
              hexpand: true,
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
          ],
        }),
      }),
    ],
  })
};

export const Quicksettings = () => {
  // Used to take a screenshot without including the quicksettings menu.
  let opacity = Variable(1.0);

  let top_button_battery = Button({
    icon: battery.bind("icon_name"),
    label: battery.bind("percent").as(percent => `  ${percent}%`),
    on_click() {
      Utils.execAsync(`bash -c "XDG_CURRENT_DESKTOP=gnome gnome-control-center power"`);
      App.closeWindow("quicksettings");
    },
  });

  let top_buttons = [
    Button({
      icon: "applets-screenshooter-symbolic",
      async on_click() {
        const monitor_id = hyprland.active.monitor;
        const monitor_name = hyprland.getMonitor(monitor_id.id)?.name;

        opacity.value = 0.0;
        // Ensure the quicksettings window is actually invisible when screenshotting.
        App.getWindow("quicksettings")?.queue_draw();
        await new Promise(r => setTimeout(r, 10));

        await Utils.execAsync(`bash -c "grim -o ${monitor_name} /tmp/_screenshot"`);

        Utils.execAsync(`bash -c "wl-copy < /tmp/_screenshot"`);
        Utils.execAsync(`notify-send -a System "Screenshot captured" "You can paste the image from your clipboard." -i /tmp/_screenshot`);

        opacity.value = 1.0;
        App.closeWindow("quicksettings");
      },
    }),
    Button({
      icon: "settings-symbolic",
      on_click() {
        Utils.execAsync(`bash -c "XDG_CURRENT_DESKTOP=gnome gnome-control-center"`);
        App.closeWindow("quicksettings");
      },
    }),
    Button({
      icon: "system-lock-screen-symbolic",
      on_click() {
        // TODO: implement this when a configuration system is introduced.
        Utils.execAsync(`notify-send -a System "Unable to lock" "Locking via the bar is not yet implemented."`);
        App.closeWindow("quicksettings");
      },
    }),
    Button({
      icon: "system-shutdown-symbolic",
      on_click() {
        // TODO: a popup menu is needed as confirmation.
        Utils.execAsync(`notify-send -a System "Unable to power down" "Shutting down via the bar is not yet implemented."`);
        App.closeWindow("quicksettings");
      },
    }),
  ];

  return PopupWindow({
    name: "quicksettings",
    child: Widget.Box({
      opacity: opacity.bind(),
      className: "quicksettings",
      vertical: true,
      hexpand: false,
      vexpand: false,
      children: [
        Widget.CenterBox({
          className: "button-row",
          vertical: false,
          start_widget: Widget.Box({
            hpack: "start",
            children: battery.available
              ? [top_button_battery]
              : top_buttons.slice(0, top_buttons.length / 2),
          }),
          end_widget: Widget.Box({
            hpack: "end",
            children: battery.available
              ? top_buttons
              : top_buttons.slice(top_buttons.length / 2),
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
          className: "toggle-buttons",
          setup(self) {
            // Ensure the children have the same size.
            self.homogeneous = true;
            self.hexpand = true;
            self.min_children_per_line = 2;
            self.max_children_per_line = 2;
            self.row_spacing = 12;
            self.column_spacing = 12

            self.add(
              ToggleButton({
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
              ToggleButton({
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
              ToggleButton({
                icon: night_light.bind("enabled").as(
                  enabled => enabled ? "night-light-symbolic" : "night-light-disabled-symbolic",
                ),
                label: "Night Light",
                active: night_light.bind("enabled"),
                onToggled({ active }) {
                  night_light.enabled = active;
                },
              }),
            );
          },
        })
      ],
    }),
  });
};
