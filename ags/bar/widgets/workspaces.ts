import type GLib from "gi://GLib";
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

          // The workspace that is currently shown as active on the bar.
          const shown_active_workspace = Variable(1);
          // The active workspace that the bar should visually be moving towards.
          let target_active_workspace = 1;
          // A ticker used to smoothly interpolate the shown_active_workspace to the real active
          // workspace.
          let workspace_ticker: null | GLib.Source = null;

          const smooth_active_workspace = Utils.merge(
            [
              hyprland.bind("monitors").as((monitors) => monitors[monitor].activeWorkspace.id),
              shown_active_workspace.bind(),
            ],
            (real_active, shown_active) => {
              target_active_workspace = real_active;

              const step_amount = Math.abs(shown_active - real_active);
              if (step_amount === 0) {
                return shown_active;
              }

              if (workspace_ticker !== null) {
                clearInterval(workspace_ticker);
              }
              workspace_ticker = setInterval(
                () => {
                  if (target_active_workspace > shown_active_workspace.value) {
                    shown_active_workspace.value++;
                  } else if (target_active_workspace < shown_active_workspace.value) {
                    shown_active_workspace.value--;
                  } else {
                    if (workspace_ticker !== null) {
                      clearInterval(workspace_ticker);
                      workspace_ticker = null;
                    }
                  }
                },
                (50 + Math.min(Math.max(step_amount - 1, 0), 2) * 50) / step_amount,
              );

              // Display one step ahead of the `snown_active` variable to make the animation more
              // responsive (play it instantly when workspace is switched).
              let ret = shown_active;
              if (target_active_workspace > shown_active_workspace.value) {
                ret++;
              } else if (target_active_workspace < shown_active_workspace.value) {
                ret--;
              }
              return ret;
            },
          );

          self.hook(
            hyprland,
            (self) => {
              const old_workspace_count = self.children.length;
              const new_workspace_count = calc_workspace_count();

              for (let i = old_workspace_count; i < new_workspace_count; i++) {
                self.add(
                  WorkspaceIndicator(smooth_active_workspace.as((active) => active === i + 1)),
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
