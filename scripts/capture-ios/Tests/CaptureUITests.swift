import XCTest

final class CaptureUITests: XCTestCase {
    func testBookOpeningAndPageTurns() {
        let app = XCUIApplication(bundleIdentifier: "com.section9labs.Libros")
        app.launch()
        sleep(4)
        let cover = app.coordinate(withNormalizedOffset: CGVector(dx: 0.50, dy: 0.35))
        cover.tap()
        sleep(5)
        let nextPage = app.coordinate(withNormalizedOffset: CGVector(dx: 0.86, dy: 0.52))
        nextPage.tap()
        sleep(2)
        nextPage.tap()
        sleep(2)
        XCTAssertTrue(app.exists)
    }
}
