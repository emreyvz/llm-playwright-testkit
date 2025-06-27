Feature: Captcha Feature

  @normalCaptcha
  Scenario: Solve a normal captcha
    Given I navigate to "BASE_URL"
    When I click the "normalCaptchaMenuButton" element on the "2CaptchaDemoPage" page
    Then I should see the page title contains "Captcha demo"
    And I solve "captchaImage" element captcha on the "NormalCaptchaPage" page and fill the result into the "captchaInput" element on the "NormalCaptchaPage" page
    And I wait for 3 seconds
  
  @questionAnswerCaptcha
  Scenario: Solve a question/answer captcha
    Given I navigate to "BASE_URL"
    When I click the "questionAnswerMenuButton" element on the "2CaptchaDemoPage" page
    Then I should see the page title contains "Captcha demo"
    And I solve "captchaText" element question captcha on the "QuestionAnswerCaptchaPage" page and fill the result into the "captchaInput" element on the "QuestionAnswerCaptchaPage" page
    And I wait for 3 seconds
