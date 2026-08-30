Pod::Spec.new do |s|
  s.name             = 'HardwareKeyboardCommand'
  s.version          = '1.0.0'
  s.summary          = 'Hardware keyboard Return command boundary for Happy'
  s.description      = s.summary
  s.license          = 'MIT'
  s.author           = 'myartings'
  s.homepage         = 'https://github.com/myartings/happy'
  s.platforms        = { :ios => '15.1' }
  s.swift_version    = '5.9'
  s.source           = { :git => 'https://github.com/myartings/happy.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = '**/*.{h,m,swift}'
end
