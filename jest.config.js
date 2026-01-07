module.exports = {
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: ["labs/**/*.js", "scripts/**/*.js"],
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "./coverage/junit", outputName: "jest-results.xml" }],
  ],
};
