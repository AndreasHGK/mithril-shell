import type { Notification as NotificationInfo } from "types/service/notifications";

import NotificationIcon from "./icon";

import { formatTime } from "lib/format";

export default (notification: NotificationInfo) => {
  const content = Widget.Box({
    class_name: "content",
    children: [
      NotificationIcon(notification),
      Widget.Box({
        hexpand: true,
        vertical: true,
        children: [
          Widget.Box({
            children: [
              Widget.Label({
                className: "title",
                xalign: 0,
                justification: "left",
                hexpand: true,
                maxWidthChars: 24,
                truncate: "end",
                wrap: true,
                label: notification.summary.trim(),
                use_markup: true,
              }),
              Widget.Label({
                class_name: "time",
                vpack: "start",
                label: formatTime(notification.time),
              }),
              Widget.Button({
                class_name: "close-button",
                vpack: "start",
                child: Widget.Icon("window-close-symbolic"),
                on_clicked: notification.close,
              }),
            ],
          }),
          Widget.Label({
            class_name: "description",
            hexpand: true,
            use_markup: true,
            xalign: 0,
            justification: "left",
            label: notification.body.trim(),
            max_width_chars: 24,
            wrap: true,
          }),
        ],
      }),
    ],
  });

  const actionsbox =
    notification.actions.length > 0
      ? Widget.Revealer({
          transition: "slide_down",
          child: Widget.EventBox({
            child: Widget.Box({
              class_name: "actions horizontal",
              children: notification.actions.map((action) =>
                Widget.Button({
                  class_name: "action-button",
                  on_clicked: () => notification.invoke(action.id),
                  hexpand: true,
                  child: Widget.Label(action.label),
                }),
              ),
            }),
          }),
        })
      : null;

  return Widget.Box({
    class_name: `notification ${notification.urgency}`,
    child: Widget.EventBox({
      vexpand: false,
      on_primary_click: notification.dismiss,
      on_hover() {
        if (actionsbox) actionsbox.reveal_child = true;
      },
      on_hover_lost() {
        if (actionsbox) actionsbox.reveal_child = true;

        notification.dismiss();
      },
      child: Widget.Box({
        vertical: true,
        children: actionsbox ? [content, actionsbox] : [content],
      }),
    }),
  });
};
