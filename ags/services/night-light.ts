import { Subprocess } from "types/@girs/gio-2.0/gio-2.0.cjs";

class NightLightService extends Service {
  static {
    Service.register(
      this,
      {},
      {
        'enabled': ['boolean', 'rw'],
      },
    );
  }

  #process: null | Subprocess = null;

  get enabled() {
    return this.#process !== null;
  }

  set enabled(value: boolean) {
    if (value === (this.#process !== null)) {
      return;
    }

    if (value) {
      this.#process = Utils.subprocess(
        ["gammastep", "-O", "4000"],
        (_) => { },
        (err) => {
          if (err.includes("Zero outputs support gamma adjustment")) {
            print("Failed to enable night light.");
            
            // Set a timeout so the user sees some feedback that the process failed.
            setTimeout(() => {
              if (this.#process === null) {
                return;
              }

              this.#process?.force_exit();
              this.#process = null;
              this.changed('enabled');
            }, 200);
          }
        },
      );
    } else {
      this.#process?.force_exit();
      this.#process = null;
    }
    this.changed('enabled');
  }

  constructor() {
    super();

    this.changed('enabled');
  }
}

const service = new NightLightService;

export default service;
