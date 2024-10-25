import { Icon } from "lib/types";
import { Binding } from "types/service";
import night_light from "services/night-light";
import NM from "gi://NM";
import Gtk from "gi://Gtk?version=3.0";

const bluetooth = await Service.import("bluetooth");
const network = await Service.import("network");

/**
 * Big pill shaped buttons arranged in a grid in the quicksettings menu.
 *
 * @param label - Main label of the button displaying what the button is for.
 * @param subtext - Optional text under the main label providing extra info about the state of the
 * system that the button controls. An example is showing the current connected Wi-Fi network SSID.
 * @param onExpand - The chevron button on the right of the pill button is pressed. This button is
 * hidden if a handler is not provided.
 */
const ToggleButton = (props: {
  icon: Icon,
  label: string | Binding<any, any, string>,
  subtext?: Binding<any, any, string | null>,
  active: boolean | Binding<any, any, boolean>,
  visible?: Binding<any, any, boolean>,
  onToggled: (event: { active: boolean }) => void,
  onExpand?: () => void,
}) => {
  const main_label = Widget.Label({
    hpack: "start",
    label: props.label,
    truncate: "end",
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
          truncate: "end",
        })
      );
    }

    return children;
  });

  return Widget.Box({
    setup(self) {
      if (props.onExpand !== undefined) {
        self.add(
          Widget.Button({
            className: "chevron",
            child: Widget.Icon({
              size: 15,
              icon: "go-next-symbolic",
            }),
            onClicked() {
              // Typescript is unhappy without the cast.
              (props as any).onExpand();
            },
          }),
        );
      }

      // Hack to make the filter function actually detect a change.
      if (props.visible) {
        self.hook(props.visible.emitter, self => {
          if (!self.parent) {
            return;
          }
          (self.parent as Gtk.FlowBoxChild).changed();
        }, "changed");
      }
    },
    visible: props.visible ?? false,
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
  });
};

const toggle_buttons = {
  wifi: ToggleButton({
    visible: network
      .wifi
      .bind("state")
      .as(state => !(["unmanaged", "unavailable", "unknown"].includes(state))),
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
    onExpand() {
      Utils.execAsync("mithril-control-center wifi");
      App.closeWindow("quicksettings");
    },
  }),

  bluetooth: ToggleButton({
    visible: bluetooth.bind("state").as(state => state !== "absent"),
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
    onExpand() {
      Utils.execAsync("mithril-control-center bluetooth");
      App.closeWindow("quicksettings");
    },
  }),

  vpn: ToggleButton({
    visible: network.vpn.bind("connections").as(cons => cons.length > 0),
    icon: network.vpn
      .bind("activated_connections")
      .as(cons => cons.length > 0 ? "network-vpn-symbolic" : "network-vpn-disconnected-symbolic"),
    label: "VPN",
    subtext: network.vpn.bind("activated_connections").as(cons => {
      if (cons.length === 0) {
        return null;
      }
      if (cons.length === 1) {
        return cons[0].id;
      }

      return `${cons.length} connections`;
    }),
    active: network.vpn.bind("activated_connections").as(cons => cons.length > 0),
    onToggled({ active }) {
      // Deactivate all vpn connections.
      if (!active) {
        for (const connection of network.vpn.activated_connections) {
          network.vpn.deactivateVpnConnection(connection);
        }
        return;
      }

      if (network.vpn.activated_connections.length != 0 || network.vpn.connections.length == 0) {
        return;
      }
      // Connect to the most recent vpn connection.
      const sorted_cons = network
        .vpn
        .connections
        .sort(
          (a, b) => b.connection.get_setting_connection().timestamp
            - a.connection.get_setting_connection().timestamp
        );

      network.vpn.activateVpnConnection(sorted_cons[0]);
    },
    onExpand() {
      Utils.execAsync("mithril-control-center network");
      App.closeWindow("quicksettings");
    },
  }),

  nightLight: ToggleButton({
    icon: night_light.bind("enabled").as(
      enabled => enabled ? "night-light-symbolic" : "night-light-disabled-symbolic",
    ),
    label: "Night Light",
    active: night_light.bind("enabled"),
    onToggled({ active }) {
      night_light.enabled = active;
    },
  }),
};

export const Toggles = () => Widget.Scrollable({
  hscroll: 'never',
  vscroll: 'never',
  child: Widget.FlowBox({
    className: "toggle-buttons",
    setup(self) {
      // Ensure the children have the same size.
      self.homogeneous = true;
      self.min_children_per_line = 2;
      self.max_children_per_line = 2;
      self.row_spacing = 12;
      self.column_spacing = 12;

      // For some reason the visible property is extremely inconsistent in flowboxes, so this makes
      // sure the toggle buttons are hidden when they should be.
      self.set_filter_func((child) => child.child.get_visible());

      const elems = [
        toggle_buttons.wifi,
        toggle_buttons.bluetooth,
        toggle_buttons.vpn,
        toggle_buttons.nightLight,
      ];

      for (const elem of elems) {
        self.add(elem);
      }
    },
  }),
});
