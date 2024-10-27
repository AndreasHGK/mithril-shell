import { PopupWindow } from "window";

type ModalSettings = {
  title: string,
  description: string,
  noOption: string,
  yesOption: string,
  emphasize: "yes" | "no",
};

/**
 * Configures the content shown in the global instance of the modal window.
 *
 * Initialized with default settings, they will be overriden on the first call to `showModal()`.
 */
const modal_settings = Variable<ModalSettings>({
  title: "",
  description: "",
  noOption: "",
  yesOption: "",
  emphasize: "no",
});

let modal_handler = (_yes: boolean) => { };

/**
 * The global modal window instance.
 *
 * Define a global instance of a modal window to reduce the time it takes to open the modal, as on
 * some devices it is very delayed otherwise.
 */
const modal_window = PopupWindow({
  name: "modal",
  location: "center",
  popupAnimation: "none",
  windowStyle: "darkened",
  clickoff: false,
  exclusivity: "ignore",
  child: Widget.Box({
    vertical: true,
    className: "modal popup",
    children: [
      Widget.Box({
        className: "content",
        vertical: true,
        hpack: "center",
        vpack: "center",
        hexpand: true,
        children: [
          Widget.Label({
            className: "title",
            hpack: "center",
            vpack: "center",
            label: modal_settings.bind().as(s => s.title),
          }),
          Widget.Label({
            className: "description",
            hpack: "center",
            vpack: "center",
            label: modal_settings.bind().as(s => s.description),
          }),
        ],
      }),
      Widget.Box({
        className: "buttons",
        homogeneous: true,
        children: [
          Widget.Button({
            className: modal_settings.bind().as(s => "no-button" + (s.emphasize === "no" ? " emphasize" : "")),
            child: Widget.Label({
              label: modal_settings.bind().as(s => s.noOption),
            }),
            onClicked(_self) {
              App.closeWindow("modal");
              modal_handler(false);
            },
          }),
          Widget.Button({
            className: modal_settings.bind().as(s => "yes-button" + (s.emphasize === "yes" ? " emphasize" : "")),
            child: Widget.Label({
              label: modal_settings.bind().as(s => s.yesOption),
            }),
            onClicked(_self) {
              App.closeWindow("modal");
              modal_handler(true);
            },
          }),
        ]
      }),
    ],
  }),
});

App.addWindow(modal_window);

/**
 * Opens a modal window with a configurable yes/no option. The promise will resolve when either
 * button is pressed, returning true if the yes button is pressed and false otherwise.
 */
export function showModal(settings: ModalSettings): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (modal_window.is_visible()) {
      reject("A modal is already open");
      return;
    }

    modal_settings.value = settings;
    modal_handler = resolve;

    App.openWindow("modal");
  });
}
