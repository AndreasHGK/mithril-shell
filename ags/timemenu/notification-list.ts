import { type Notification as NotificationInfo } from "types/service/notifications";

import Notification from "./notification";

const notificationService = await Service.import("notifications");
const notifications = notificationService.bind("notifications");

const Animated = (n: NotificationInfo) => Widget.Revealer({
  transition_duration: 200,
  transition: "slide_down",
  child: Notification(n),
  setup: self => Utils.timeout(200, () => {
    if (!self.is_destroyed)
      self.reveal_child = true;
  }),
});

const Placeholder = () => Widget.Box({
  visible: notifications.as(n => n.length === 0),
  hpack: "center",
  vpack: "center",
  children: [
    Widget.Icon("notifications-disabled-symbolic"),
    Widget.Label("Your inbox is empty"),
  ],
});

const NotificationList = () => {
  const map: Map<number, ReturnType<typeof Animated>> = new Map
  let box = Widget.Box({
    vertical: true,
    children: notificationService.notifications.map(n => {
      const w = Animated(n)
      map.set(n.id, w)
      return w
    }),
    visible: notifications.as(n => n.length > 0),
  })

  function remove(_: unknown, id: number) {
    const n = map.get(id)
    if (n) {
      n.reveal_child = false
      Utils.timeout(200, () => {
        n.destroy()
        map.delete(id)
      })
    }
  }

  box = box
    .hook(notificationService, remove, "closed")
    .hook(notificationService, (_, id: number) => {
      if (id !== undefined) {
        if (map.has(id))
          remove(null, id)

        const n = notificationService.getNotification(id)!

        const w = Animated(n)
        map.set(id, w)
        box.children = [w, ...box.children]
      }
    }, "notified")

  return Widget.Box({
    children: [
      Widget.Scrollable({
        class_name: "notifications-scrollable",
        vexpand: true,
        hscroll: "never",
        child: box
      })
    ],
  })
};

export default () => Widget.Box({
  children: [
    Placeholder(),
    NotificationList(),
  ],
});
