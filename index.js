// Add .env file onto /var/lib/homebridge/

const EspSwitch = require("./src/switch.js");
const dhtSensor = require("./src/dht.js");

const i = homebridge => {
  homebridge.registerAccessory("homebridge-esp", "esp", EspSwitch);
  homebridge.registerAccessory("homebridge-esp", "dht", dhtSensor);
};

module.exports = i;
