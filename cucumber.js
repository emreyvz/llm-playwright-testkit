module.exports = {
  default: {
    paths: ['features/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['steps/**/*.ts', 'hooks/**/*.ts'],
    format: [
      'summary',
      'progress-bar',
      '@cucumber/pretty-formatter',
      'json:reports/cucumber_report.json',
    ],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
    worldParameters: {},
    timeout: 60000,
    retry: 0,
    parallel: 1,
  },
};
