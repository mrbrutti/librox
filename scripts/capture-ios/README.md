# Librox website footage capture

This small XCUITest project drives an **already installed** Librox simulator app. It does not change app source or the generated Librox Xcode project. The test starts on the Reading screen, taps the sample cover, waits for the reader, then turns two pages. Coordinates are tied to the iPhone 17 Pro capture size and should be reviewed when the app layout changes.

Use a dedicated simulator. Copy this folder to a temporary directory before running XcodeGen so generated files do not enter the website checkout. Install the intended Librox build on that simulator first, set a clean status bar, then build and run the capture runner:

```sh
cp -R scripts/capture-ios /tmp/librox-capture-tests
cd /tmp/librox-capture-tests
xcodegen generate
xcodebuild -project LibroxCaptureRunner.xcodeproj -scheme CaptureHost \
  -destination 'platform=iOS Simulator,id=<SIMULATOR_UDID>' \
  -derivedDataPath /tmp/librox-capture-tests/DerivedData \
  -parallel-testing-enabled NO -skipPackagePluginValidation \
  build-for-testing CODE_SIGNING_ALLOWED=NO
```

Start `xcrun simctl io <SIMULATOR_UDID> recordVideo --codec=h264 output.mp4` in another terminal, then run:

```sh
xcodebuild -project LibroxCaptureRunner.xcodeproj -scheme CaptureHost \
  -destination 'platform=iOS Simulator,id=<SIMULATOR_UDID>' \
  -derivedDataPath /tmp/librox-capture-tests/DerivedData \
  -parallel-testing-enabled NO \
  test-without-building CODE_SIGNING_ALLOWED=NO
```

Stop recording with Control-C. Review the native recording frame by frame, trim one continuous take, and encode a muted H.264 web clip plus a poster. The current 13.23-second website clip was captured from Librox 1.5 (45) on an iPhone 17 Pro iOS 26.5 simulator, then scaled to 720 px at 30 fps. It is labeled as in-development footage. The native recording has a four-second gap between encoded frames while the cover is static; start the trim before that gap so the cover remains visible before opening.
