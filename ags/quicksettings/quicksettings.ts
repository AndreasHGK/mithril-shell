import { Icon } from "lib/types";
import { Binding } from "types/service";
import { PopupWindow } from "window";
import { Sliders } from "./sliders";
import { Toggles } from './toggles';
import { showModal } from "modal";

const battery = await Service.import("battery");
const hyprland = await Service.import("hyprland");

/** Constructor for the top buttons in the quicksettings menu. */
const Button = (props: {
  onClick?: () => void,
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
    onClicked: props.onClick ?? (() => { }),
    className: "button",
    child: Widget.Box({
      children,
    })
  });
};

export const Quicksettings = () => {
  // Used to take a screenshot without including the quicksettings menu.
  let opacity = Variable(1.0);

  let top_button_battery = Button({
    icon: battery.bind("icon_name"),
    label: battery.bind("percent").as(percent => ` ${percent}%`),
    onClick() {
      Utils.execAsync("mithril-control-center power");
      App.closeWindow("quicksettings");
    },
  });

  let top_buttons = [
    Button({
      icon: "applets-screenshooter-symbolic",
      async onClick() {
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
      onClick() {
        Utils.execAsync("mithril-control-center");
        App.closeWindow("quicksettings");
      },
    }),
    Button({
      icon: "system-lock-screen-symbolic",
      onClick() {
        // TODO: implement this when a configuration system is introduced.
        Utils.execAsync(`notify-send -a System "Unable to lock" "Locking via the bar is not yet implemented."`);
        App.closeWindow("quicksettings");
      },
    }),
    Button({
      icon: "system-shutdown-symbolic",
      async onClick() {
        const shutdown_future = showModal({
          title: "Power Off",
          description: "Are you sure you want to power off the computer?",
          noOption: "Cancel",
          yesOption: "Power Off",
          emphasize: "no",
        });

        App.closeWindow("quicksettings");

        if (await shutdown_future) {
          await Utils.execAsync("shutdown now");
        }
      },
    }),
  ];

  return PopupWindow({
    name: "quicksettings",
    location: "top-right",
    child: Widget.Box({
      opacity: opacity.bind(),
      className: "quicksettings popup",
      vertical: true,
      hexpand: false,
      vexpand: false,
      children: [
        Widget.CenterBox({
          className: "button-row",
          vertical: false,
          startWidget: Widget.Box({
            hpack: "start",
            children: battery.available
              ? [top_button_battery]
              : top_buttons.slice(0, top_buttons.length / 2),
          }),
          endWidget: Widget.Box({
            hpack: "end",
            children: battery.available
              ? top_buttons
              : top_buttons.slice(top_buttons.length / 2),
          }),
        }),

        Sliders(),

        Toggles(),
      ],
    }),
  });
};
