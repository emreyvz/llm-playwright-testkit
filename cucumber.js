module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['src/steps/**/*.ts', 'src/hooks/**/*.ts'],
    format: [
      'summary',
      'progress-bar',
      '@cucumber/pretty-formatter',
      'json:reports/cucumber_report.json', // Standard JSON report
      'allure-cucumberjs:reports/allure-results/allure-results.json' // Allure JSON results
      // 'html:reports/cucumber_report.html' // You can enable this for an HTML report
    ],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true, // Suppresses Cucumber's own publish message
    worldParameters: {
      // You can pass global parameters to your World context here
    },
    timeout: 60000, // Milliseconds
    retry: 0, // Number of retries for failed scenarios
    parallel: 1, // Number of parallel workers. Set to 0 to use Playwright's parallel capabilities if preferred.
  },
};
