# Journal: `hardware-keyboard-enter-send`

## `2026-08-28`

- Started workflow.
- Accepted the simplified contract: preserve software-keyboard behavior and
  intercept only unmodified Return from an attached Apple hardware keyboard.
- Rejected RN `onKeyPress` modifier inference and third-party async key-event
  propagation as insufficient to suppress the native newline reliably.
