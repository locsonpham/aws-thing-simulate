// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
var awsIot = require("aws-iot-device-sdk");
require("dotenv").config();

//
// Replace the values of '<YourUniqueClientIdentifier>' and '<YourCustomEndpoint>'
// with a unique client identifier and custom host endpoint provided in AWS IoT cloud
// NOTE: client identifiers must be unique within your AWS account; if a client attempts
// to connect with a client identifier which is already in use, the existing
// connection will be terminated.
//
var clientId = process.env.CLIENT_ID;

// var device = awsIot.device({
//   keyPath: process.env.AWS_PRIVATE_KEY_PATH,
//   certPath: process.env.AWS_CERT_PATH,
//   caPath: process.env.AWS_CA_PATH,
//   clientId: process.env.CLIENT_ID,
//   host: process.env.AWS_HOST,
// });

// //
// // Device is an instance returned by mqtt.Client(), see mqtt.js for full
// // documentation.
// //
// device.on("connect", function () {
//   console.log("connect");
//   device.subscribe(`demeter/things/${clientId}/#`);
//   device.publish(
//     `demeter/things/${clientId}/update`,
//     JSON.stringify({ test_data: 1 })
//   );
// });

// device.on("message", function (topic, payload) {
//   console.log("message", topic, payload.toString());
// });

var thingShadows = awsIot.thingShadow({
  keyPath: process.env.AWS_PRIVATE_KEY_PATH,
  certPath: process.env.AWS_CERT_PATH,
  caPath: process.env.AWS_CA_PATH,
  clientId: process.env.CLIENT_ID,
  host: process.env.AWS_HOST,
});

//
// Client token value returned from thingShadows.update() operation
//
var clientTokenUpdate;

//
// Simulated device values
//
var rval = 187;
var gval = 114;
var bval = 222;

thingShadows.on("connect", function () {
  //
  // After connecting to the AWS IoT platform, register interest in the
  // Thing Shadow named 'RGBLedLamp'.
  //
  // console.log("shadow connected to AWS");
  // thingShadows.subscribe(`demeter/things/${clientId}/#`);
  // thingShadows.publish(
  //   `demeter/things/${clientId}/update`,
  //   JSON.stringify({ test_data: 1 })
  // );

  thingShadows.register(clientId, {}, function () {
    // Once registration is complete, update the Thing Shadow named
    // 'RGBLedLamp' with the latest device state and save the clientToken
    // so that we can correlate it with status or timeout events.
    //
    // Thing shadow state
    //

    console.log("shadow registered: " + clientId);

    var rgbLedLampState = {
      state: { desired: { red: rval, green: gval, blue: bval } },
    };

    clientTokenUpdate = thingShadows.update(clientId, rgbLedLampState);
    //
    // The update method returns a clientToken; if non-null, this value will
    // be sent in a 'status' event when the operation completes, allowing you
    // to know whether or not the update was successful.  If the update method
    // returns null, it's because another operation is currently in progress and
    // you'll need to wait until it completes (or times out) before updating the
    // shadow.
    //
    if (clientTokenUpdate === null) {
      console.log("update shadow failed, operation still in progress");
    }
  });
});

thingShadows.on("message", function (topic, payload) {
  console.log("message", topic, payload.toString());
});

thingShadows.on("status", function (thingName, stat, clientToken, stateObject) {
  console.log(
    "received " + stat + " on " + thingName + ": " + JSON.stringify(stateObject)
  );
  //
  // These events report the status of update(), get(), and delete()
  // calls.  The clientToken value associated with the event will have
  // the same value which was returned in an earlier call to get(),
  // update(), or delete().  Use status events to keep track of the
  // status of shadow operations.
  //
});

thingShadows.on("delta", function (thingName, stateObject) {
  console.log(
    "received delta on " + thingName + ": " + JSON.stringify(stateObject)
  );
});

thingShadows.on("timeout", function (thingName, clientToken) {
  console.log(
    "received timeout on " + thingName + " with token: " + clientToken
  );
  //
  // In the event that a shadow operation times out, you'll receive
  // one of these events.  The clientToken value associated with the
  // event will have the same value which was returned in an earlier
  // call to get(), update(), or delete().
  //
});
