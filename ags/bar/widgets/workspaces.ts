import { config } from "lib/settings.js";
import type { Binding } from "types/service.js";
import { BarWidget } from "../bar-widget.js";

const hyprland = await Service.import("hyprland");

const WorkspaceIndicator = (active: Binding<any, any, boolean>) =>
  Widget.Box({
    className: active.as((active) => `workspace-indicator${active ? " active" : ""}`),
    vexpand: false,
    visible: true,
  });

export const Workspaces = (monitor: number) =>
  BarWidget({
    child: Widget.CenterBox({
      centerWidget: Widget.Box({
        className: "workspaces",
        setup(self) {
          const calc_workspace_count = () => {
            // Workspaces start with ID 1. It is limited to 25 to keep it reasonable should hyprland
            // return anything unexpected.
            return Math.max(
              // Always prioritize the value from the config as a minimum amount.
              config.minWorkspaces,
              Math.min(25, Math.max(...hyprland.workspaces.map((workspace) => workspace.id))),
            );
          };

          self.hook(
            hyprland,
            (self) => {
              const old_workspace_count = self.children.length;
              const new_workspace_count = calc_workspace_count();

              for (let i = old_workspace_count; i < new_workspace_count; i++) {
                self.add(
                  WorkspaceIndicator(
                    hyprland
                      .bind("monitors")
                      .as((monitors) => monitors[monitor])
                      .as((monitor) => monitor.activeWorkspace.id === i + 1),
                  ),
                );
              }
            },
            "workspace-added",
          );
          self.hook(
            hyprland,
            (self) => {
              const old_workspace_count = self.children.length;
              const new_workspace_count = calc_workspace_count();

              for (let i = old_workspace_count; i > new_workspace_count; i--) {
                self.remove(self.children[i - 1]);
              }
            },
            "workspace-removed",
          );
        },
      }),
    }),
    on_scroll_up: () => {
      hyprland.messageAsync("dispatch workspace +1");
    },
    on_scroll_down: () => {
      hyprland.messageAsync("dispatch workspace -1");
    },
  });
