import type { Notification as NotificationInfo } from "types/service/notifications";

import { Option, Some, None } from "lib/option-rs";

const iconAsOption = (icon: string): Option<string> => {
  return Utils.lookUpIcon(icon) ? new Some(icon) : new None();
};

export default ({ app_entry, app_icon, image }: NotificationInfo) => {
  if (image !== undefined) {
    return Widget.Box({
      className: "image",
      css: `
        background-image: url("${image}");
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
      `,
    });
  }

  const icon = Option.from(app_entry)
    .andThen(iconAsOption)
    .orElse(() => iconAsOption(app_icon))
    .unwrapOr(""); // TODO: Add some fallback icon here.;

  return Widget.Box({
    className: "image",
    child: Widget.Icon({
      icon,
      className: "icon",
      hpack: "center",
      vpack: "center",
      hexpand: true,
      vexpand: true,
    }),
  });
};