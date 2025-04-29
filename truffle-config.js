const path = require("path");

module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      host: "127.0.0.1", // Localhost
      port: 8545,        // ✅ Ganache CLI default port
      network_id: "*",   // Match any network
    },
  },

  mocha: {
    // timeout: 100000
  },

  compilers: {
    solc: {
      version: "0.8.14", // Your chosen Solidity version
    },
  },

  // db: {
  //   enabled: false,
  // }
};
