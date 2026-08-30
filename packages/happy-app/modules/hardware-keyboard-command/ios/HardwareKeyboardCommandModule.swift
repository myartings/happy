import ExpoModulesCore

public class HardwareKeyboardCommandModule: Module {
  public func definition() -> ModuleDefinition {
    Name("HardwareKeyboardCommand")

    View(HardwareKeyboardCommandView.self) {
      Events("onHardwareReturn")
    }
  }
}
