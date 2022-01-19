// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
var awsIot = require("aws-iot-device-sdk");
require("dotenv").config();

//
// Replace the values of '<YourUniqueClientIdentifier>' and '<YourCustomEndpoint>'
// with a unique client identifier and custom host endpoint provided in AWS IoT.
// NOTE: client identifiers must be unique within your AWS account; if a client attempts
// to connect with a client identifier which is already in use, the existing
// connection will be terminated.
//
var device = awsIot.device({
  keyPath: process.env.AWS_PRIVATE_KEY_PATH,
  certPath: process.env.AWS_CERT_PATH,
  caPath: process.env.AWS_CA_PATH,
  clientId: process.env.CLIENT_ID,
  host: process.env.AWS_HOST,
});

//
// Device is an instance returned by mqtt.Client(), see mqtt.js for full
// documentation.
//
device.on("connect", function () {
  console.log("connect");
  device.subscribe("topic_1");
  device.publish("topic_2", JSON.stringify({ test_data: 1 }));
});

device.on("message", function (topic, payload) {
  console.log("message", topic, payload.toString());
});
