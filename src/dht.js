const db = require("./db");
const moment = require("moment");
class dhtSensor {
  constructor(log, config, api) {
    let UUIDGen = api.hap.uuid;
    this.api = api;
    this.log = log;
    this.name = config["name"];
    this.key = config["key"];
    this.state = "off";
    this.dhtService;
    this.temperature;
    this.humidity;
    this.motion = false;
    this.lighlevel;
    this.uuid = UUIDGen.generate(this.name);

    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;
  }
  getServices() {
    var informationService = new this.Service.AccessoryInformation();

    informationService
      .setCharacteristic(this.Characteristic.Manufacturer, "ESP Sensor")
      .setCharacteristic(this.Characteristic.Model, `DHT+PIR`)
      .setCharacteristic(this.Characteristic.SerialNumber, this.uuid);

    const lightLevelService = new this.Service.LightSensor(this.name);
    lightLevelService
      .getCharacteristic(this.Characteristic.CurrentAmbientLightLevel)
      .on("get", this.getLightLevel);

    const temperatureService = new this.Service.TemperatureSensor(this.name);
    temperatureService
      .getCharacteristic(this.Characteristic.CurrentTemperature)
      .on("get", this.getTemperature);

    const humidityService = new this.Service.HumiditySensor(this.name);
    humidityService
      .getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
      .on("get", this.getHumidity);

    const motionService = new this.Service.MotionSensor(this.name);
    motionService
      .getCharacteristic(this.Characteristic.MotionDetected)
      .on("get", this.getMotion);

    return [
      informationService,
      lightLevelService,
      temperatureService,
      humidityService,
      motionService
    ];
  }

  getLightLevel = (callback) => {
    db({ s: "sensors" })
      .join({ d: "devices" }, "d.id", "s.device_id")
      .where({
        "d.key": this.key,
        "s.sensor_type": "lightlevel"
      })
      .select("s.*")
      .first()
      .then(s => {
        this.level = parseInt(s.sensor_state, 10);
        const luks = Math.pow(this.level, 4) / 100000;
        callback(null, luks);
      });
  };

  getTemperature = (callback) => {
    db({ s: "sensors" })
      .join({ d: "devices" }, "d.id", "s.device_id")
      .where({
        "d.key": this.key,
        "s.sensor_type": "temperature"
      })
      .select("s.*")
      .first()
      .then(s => {
        this.temperature = parseFloat(s.sensor_state, 10);
        callback(null, this.temperature);
      });
  };

  getHumidity = (callback) => {
    db({ s: "sensors" })
      .join({ d: "devices" }, "d.id", "s.device_id")
      .where({
        "d.key": this.key,
        "s.sensor_type": "humidity"
      })
      .select("s.*")
      .first()
      .then(s => {
        this.humidity = parseFloat(s.sensor_state, 10);
        callback(null, this.humidity);
      });
  };

  getMotion = (callback) => {
    db({ s: "sensors" })
      .join({ d: "devices" }, "d.id", "s.device_id")
      .where({
        "d.key": this.key,
        "s.sensor_type": "pir"
      })
      .select("s.*")
      .first()
      .then(s => {
        const mo = moment
          .duration(moment(moment.now()).diff(moment(s.sensor_state)))
          .asSeconds();
        const passedSeconds = mo - 18000; // difference
        this.motion = passedSeconds < 60;
        callback(null, this.motion);
      });
  };
}

module.exports = dhtSensor;
