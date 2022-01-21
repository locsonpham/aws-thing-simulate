const utils = require("../utils/utils");
const _ = require("lodash");

class DeviceModel {
  constructor(props) {
    this.vID = props.vID;
    this.deviceSerial = props.deviceSerial;
    this.deviceProfile = props.deviceProfile;
    this.state = {};
    this.connection = props.connection;
    this.automation = props.automation;
    this.settings = props.settings;
    this.params = props.params;
    this.fields = Array.from(props.fields, (field) => createField(field));
    this.initialized = true;
  }

  init() {
    // simulate data
    this.simulateData();
  }

  getState() {
    var state = {};
    this.fields.map((field) => {
      state[field.fkey] = field.reportedVal;
    });
    return state;
  }

  toObject() {
    const data = {
      vID: this.vID,
      deviceSerial: this.deviceSerial,
      deviceProfile: this.deviceProfile,
      attributes: this.attributes,
      connection: this.connection,
      params: this.params,
      state: this.getState(),
      settings: this.settings,
      automation: this.automation,
    };

    return data;
  }

  simulateData() {
    this.fields.map((field) => {
      if (field.readonly == true) {
        field.reportedVal = utils.getRandomInt(0, 1000) / 10;
      }
    });
  }

  handleGet(client, payload) {
    var response;
    const acceptedTopic = `demeter/things/${this.vID}/get/accepted`;
    const rejectedTopic = `demeter/things/${this.vID}/get/rejected`;

    try {
      const req = JSON.parse(payload);
      console.log("Handle GET");

      // GET all
      if (_.isEmpty(req)) {
        response = {
          code: 200,
          data: this.toObject(),
        };

        client.publish(acceptedTopic, JSON.stringify(response));
        return;
      }

      // GET Specific requests
      var requestKeys = req.requests;
      console.log(requestKeys);

      if (_.isEmpty(requestKeys)) {
        response = {
          code: 400,
          msg: "Invalid request",
        };

        client.publish(rejectedTopic, JSON.stringify(response));
        return;
      }

      const data = {};
      requestKeys.forEach((key) => {
        data[key] = this[key];
      });

      response = {
        code: 200,
        data: data,
      };

      client.publish(acceptedTopic, JSON.stringify(response));
      return;
    } catch (e) {
      response = {
        code: 400,
        msg: "Invalid JSON",
      };

      client.publish(rejectedTopic, JSON.stringify(response));
      return;
    }
  }

  handleSet(client, payload) {
    var response;
    const acceptedTopic = `demeter/things/${this.vID}/set/accepted`;
    const rejectedTopic = `demeter/things/${this.vID}/set/rejected`;
    try {
      const req = JSON.parse(payload);

      if (_.isEmpty(req)) {
        throw Error();
      }
    } catch (e) {
      response = {
        code: 400,
        msg: "Invalid JSON",
      };

      client.publish(rejectedTopic, JSON.stringify(response));
    }
  }

  deltaUpdate(client, stateObject) {
    if (this.initialized == false) return;

    console.log("Handle DELTA: " + JSON.stringify(stateObject.state));

    const updates = Object.keys(stateObject.state);

    const allowedUpdates = [];
    this.fields.map((field, index) => {
      if (field.readonly == false) allowedUpdates.push(field.fkey);
    });

    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) return;

    updates.forEach((key) => {
      this.fields.map((field) => {
        if (field.fkey == key) {
          field.desiredVal = stateObject.state[key];

          // simulate control to change device state
          if (field.reportedVal != field.desiredVal) {
            field.reportedVal = field.desiredVal;
          }
        }
      });
    });

    this.reportDeviceState(client);
  }

  reportDeviceState(client) {
    var _curState = this.getState();
    _curState.status = "online";

    var reportedMessage = {
      state: {
        reported: _curState,
      },
    };

    console.log("Report STATE: " + JSON.stringify(_curState));

    var clientTokenUpdate = null;

    for (var i = 0; i < 1; i++) {
      clientTokenUpdate = client.update(this.vID, reportedMessage);

      if (clientTokenUpdate === null) {
        console.log("update shadow failed, operation still in progress");
        console.log("retry: " + i);
      } else {
        return clientTokenUpdate;
      }
    }
    return null;
  }
}

function createField(field) {
  return {
    fkey: "fkey" in field ? field.fkey : null,
    name: "name" in field ? field.name : null,
    readonly: "readonly" in field ? field.readonly : null,
    reportedVal: "reportedVal" in field ? field.reportedVal : null,
    desiredVal: "desiredVal" in field ? field.desiredVal : null,
  };
}

module.exports = {
  DeviceModel,
};
