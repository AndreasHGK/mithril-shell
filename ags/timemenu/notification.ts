import type { Notification as NotificationInfo } from "types/service/notifications";

import NotificationIcon from "./icon";

import { formatTime } from "lib/format";

export default (notification: NotificationInfo) => {
  const closeButtonVisible = Variable(false);

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
                useMarkup: true,
              }),
              Widget.Label({
                className: "time",
                vpack: "start",
                label: formatTime(notification.time),
              }),
              Widget.Button({
                className: "close-button",
                visible: closeButtonVisible.bind(),
                vpack: "start",
                child: Widget.Icon("window-close-symbolic"),
                onClicked: notification.close,
              }),
            ],
          }),
          Widget.Label({
            className: "description",
            hexpand: true,
            useMarkup: true,
            xalign: 0,
            justification: "left",
            label: notification.body.trim(),
            maxWidthChars: 24,
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
      onHover() {
        if (actionsbox) actionsbox.reveal_child = true;
        closeButtonVisible.setValue(true);
      },
      onHoverLost() {
        if (actionsbox) actionsbox.reveal_child = false;
        closeButtonVisible.setValue(false);
      },
      child: Widget.Box({
        vertical: true,
        children: actionsbox ? [content, actionsbox] : [content],
      }),
    }),
  });
};
