import { BarWidget } from "../bar-widget.js";

const hyprland = await Service.import("hyprland");

const workspaceIndicator = (active = false) =>
  Widget.Box({
    className: `workspace-indicator${active ? " active" : ""}`,
  });

export const Workspaces = (monitor: number) =>
  BarWidget({
    child: Widget.Box({
      className: "workspaces",
      children: Utils.merge(
        [
          hyprland.bind("workspaces"),
          // TODO: this breaks when unplugging a monitor that is not the last monitor in the list.
          hyprland
            .bind("monitors")
            .as((monitors) => monitors[monitor].activeWorkspace),
        ],
        (workspaces, active) => {
          return workspaces
            .sort((a, b) => a.id - b.id)
            .map((workspace) => workspaceIndicator(workspace.id === active.id));
        },
      ),
    }),
    on_scroll_up: () => {
      hyprland.messageAsync("dispatch workspace +1");
    },
    on_scroll_down: () => {
      hyprland.messageAsync("dispatch workspace -1");
    },
  });
