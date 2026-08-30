import ExpoModulesCore
import UIKit

final class HardwareKeyboardCommandView: ExpoView {
  let onHardwareReturn = EventDispatcher()

  override var keyCommands: [UIKeyCommand]? {
    let returnCommand = UIKeyCommand(
      input: "\r",
      modifierFlags: [],
      action: #selector(handleHardwareReturn(_:))
    )

    if #available(iOS 15.0, *) {
      returnCommand.wantsPriorityOverSystemBehavior = true
    }

    return (super.keyCommands ?? []) + [returnCommand]
  }

  override func canPerformAction(_ action: Selector, withSender sender: Any?) -> Bool {
    if action == #selector(handleHardwareReturn(_:)) {
      return !hasMarkedText(in: self)
    }

    return super.canPerformAction(action, withSender: sender)
  }

  @objc private func handleHardwareReturn(_ command: UIKeyCommand) {
    onHardwareReturn([:])
  }

  private func hasMarkedText(in view: UIView) -> Bool {
    if view.isFirstResponder, let textInput = view as? UITextInput {
      return textInput.markedTextRange != nil
    }

    return view.subviews.contains(where: hasMarkedText)
  }
}
