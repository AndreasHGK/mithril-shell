import type { Notification as NotificationInfo } from "types/service/notifications";

import { formatTime } from "lib/format";
import { conditionalChildren } from "lib/widgets";

export default (notification: NotificationInfo) => {
  const content = Widget.Box({
    className: "notification-inner",
    vertical: true,
    children: [
      Widget.Box({
        className: "header",
        hexpand: true,
        vertical: false,
        children: conditionalChildren([
          notification.app_icon
            ? Widget.Icon({
                className: "app-icon",
                vpack: "start",
                icon: notification.app_icon,
                size: 12,
              })
            : null,
          Widget.Label({
            className: "app-name",
            vpack: "start",
            label: notification.app_name,
          }),
          Widget.Label({
            className: "time",
            vpack: "start",
            label: formatTime(notification.time),
          }),
          Widget.Button({
            className: "close-button",
            hexpand: true,
            vpack: "center",
            hpack: "end",
            child: Widget.Icon("window-close-symbolic"),
            onClicked: notification.close,
          }),
        ]),
      }),
      Widget.Box({
        class_name: "content",
        vertical: false,
        children: conditionalChildren([
          notification.image
            ? Widget.Box({
                vertical: true,
                children: [
                  Widget.Box({
                    className: "image",
                    vexpand: false,
                    css: `background-image: url("${notification.image}");`,
                  }),
                  // Needed so the icon does not get stretched vertically.
                  Widget.Box({
                    vexpand: true,
                  }),
                ],
              })
            : null,
          Widget.Box({
            vertical: true,
            hexpand: true,
            hpack: "start",
            className: "text",
            vpack: "center",
            children: [
              Widget.Label({
                className: "title",
                hpack: "start",
                vpack: "end",
                justification: "left",
                xalign: 0,
                truncate: "end",
                hexpand: true,
                wrap: true,
                label: notification.summary.trim(),
                useMarkup: true,
              }),
              Widget.Label({
                className: "description",
                justification: "left",
                xalign: 0,
                useMarkup: true,
                hpack: "start",
                vpack: "end",
                label: notification.body.trim(),
                wrap: true,
              }),
            ],
          }),
        ]),
      }),
    ],
  });

  const actionsbox =
    notification.actions.length > 0
      ? Widget.Revealer({
          transition: "slide_down",
          child: Widget.EventBox({
            child: Widget.Box({
              className: "actions horizontal",
              children: notification.actions.map((action) =>
                Widget.Button({
                  className: "action-button",
                  onClicked: () => notification.invoke(action.id),
                  hexpand: true,
                  child: Widget.Label(action.label),
                }),
              ),
            }),
          }),
        })
      : null;

  return Widget.Box({
    className: `notification ${notification.urgency}`,
    child: Widget.EventBox({
      className: "event-box",
      vexpand: false,
      onPrimaryClick: notification.dismiss,
      child: Widget.Box({
        vertical: true,
        children: actionsbox ? [content, actionsbox] : [content],
      }),
    }),
  });
};
