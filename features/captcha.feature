Feature: Example Feature

  Scenario: Example Scenario
    Given I navigate to "https://2captcha.com/demo"
    When I click the "normalCaptchaMenuButton" element on the "2CaptchaDemoPage" page
    Then I should see the page title contains "Captcha demo"
    And I wait for 1 seconds
    And I type "123456" into the "normalCaptchaMenuButton" element on the "2CaptchaDemoPage" page
