const http = require("http");
// const db = require("./db");

class EspSwitch {
  constructor(log, config, api) {
    let UUIDGen = api.hap.uuid;

    this.log = log;
    this.name = config["name"];
    this.controller = config["controller"];
    this.level = config["level"];
    this.delay = config["delay"];
    this.port = config["port"] || 80;
    this.host = config["host"];
    this.power = 0;
    this.uuid = UUIDGen.generate(this.name);

    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;
  }

  getServices() {
    var informationService = new this.Service.AccessoryInformation();

    informationService
      .setCharacteristic(this.Characteristic.Manufacturer, "Delay Switch")
      .setCharacteristic(this.Characteristic.Model, `Delay-${this.delay}ms`)
      .setCharacteristic(this.Characteristic.SerialNumber, this.uuid);

    this.switchService = new this.Service.Lightbulb(this.name);

    this.switchService
      .getCharacteristic(this.Characteristic.Brightness)
      .on("get", this.getPower.bind(this))
      .on("set", this.setPower.bind(this));

    this.switchService
      .getCharacteristic(this.Characteristic.On)
      .on("get", this.getOn.bind(this))
      .on("set", this.setOn.bind(this));

    return [informationService, this.switchService];
  }
  setOn(on, callback) {
    // this.log("setOn", on);
    this.power = on ? this.level : 0;
    this.makeCall(this.power);
    callback();
  }
  setPower(power, callback) {
    // console.log("setPower", power);
    this.power = power;
    this.level = power;
    this.makeCall(power);
    callback();
  }

  makeCall(power) {
    let controllerOptions = {
      host: this.host,
      port: this.port,
      method: "GET",
      path: `/${this.controller}/${power}/${this.delay}`
    };
    http.get(controllerOptions, () => {});
  }

  getOn(callback) {
    callback(null, !!this.power);
  }
  getPower(callback) {
    callback(null, this.power);
  }
}

module.exports = EspSwitch;
