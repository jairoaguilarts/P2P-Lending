const HDWalletProvider = require('truffle-hdwallet-provider');

const mnemonic = 'asset duty finger galaxy mechanic vendor glance cement logic ceiling razor lounge';
const infuraApiKey = '9f3a2c64450c41ed8a581f654b4c4711';

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",    
      port: 7545,           
      network_id: "*",      
    },
    ropsten: {
      provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/${infuraApiKey}`),
      network_id: 3,       
      gas: 5500000,        
      confirmations: 2,    
      timeoutBlocks: 200,  
      skipDryRun: true     
    },
  },
  compilers: {
    solc: {
      version: "0.8.0",    
    }
  }
};
