/**
 * Copyright 2019, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *   http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Fakecandy is a fake openpixelcontrol server that:
// - prints led state on standard output.
// - responds to UDP broadcast with device information encoded in CBOR

import * as yargs from "yargs";
const argv = yargs
  .usage("Usage: $0 --udp_discovery_port PORT_NUMBER --udp_discovery_packet PACKET_STRING --device_id ID")
  .option("udp_discovery_port", {
    describe: "port to listen on for UDP discovery query",
    type: "number",
    demandOption: true,
  })
  .option("udp_discovery_packet", {
    describe: "hex encoded packet content to match for UDP discovery query",
    type: "string",
    demandOption: true,
  })
  .option("hardware_revision", {
    describe: "hardware revision to return in the UDP discovery response",
    default: "evt-1",
  })
  .option("firmware_revision", {
    describe: "firmware revision to return in the UDP discovery response",
    default: "v1-beta",
  })
  .argv;

import * as cbor from "cbor";
import * as dgram from "dgram";

import { Tedis, TedisPool } from "tedis";

const socket = dgram.createSocket("udp4");
const redis = new Tedis({
  host: "192.168.1.201",
  port: 6379
}); 
// Handle discovery request.
socket.on("message", (msg, rinfo) => {
  const discoveryPacket = Buffer.from(argv.udp_discovery_packet, "hex");
  if (msg.compare(discoveryPacket) !== 0) {
    console.warn("received unknown payload:", msg, "from:", rinfo);
    return;
  }
  console.debug("received discovery payload:", msg, "from:", rinfo);
  // Reply to discovery request with device parameters encoded in CBOR.
  // note: any encoding/properties could be used as long as the app-side can
  // interpret the payload.
  const discoveryData = {
    id: "local-light-id",
    model: "Home made",
    hw_rev: argv.hardware_revision,
    fw_rev: argv.firmware_revision,
  };
  const responsePacket = cbor.encode(discoveryData);
  socket.send(responsePacket, rinfo.port, rinfo.address, (error) => {
    if (error !== null) {
      console.error("failed to send ack:", error);
      return;
    }
    console.debug("sent discovery response:", discoveryData, "to:", rinfo);
  });
});
socket.on("listening", () => {
  console.log("discovery listening", socket.address());
}).bind(argv.udp_discovery_port);

import chalk from "chalk";
import * as net from "net";
import {IOPCMessage} from "./types";
const opcStream = require("opc");
const opcParser = require("opc/parser");
const opcStrand = require("opc/strand");

// Handle OPC messages.
const server = net.createServer((conn) => {
  conn.pipe(opcParser()).on("data", (message: IOPCMessage) => {
    console.debug("received command:",message.channel, message.command, message.data);
    if(message.data[0] == 0xFF){
      redis.command("PUBLISH", "commands", `switch${message.channel}:on`);
      console.debug("Device on:");
    }
    else{      
      redis.command("PUBLISH", "commands", `switch${message.channel}:off`);
      console.debug("Device off:");
    }

    // var id = message.deviceId.replace("local-light-id-", "");
    // if(Buffer.from(message.data, "hex") === "on"){
    //     redis.command("PUBLISH", "commands", `${id}:on`);
    // }
    // else{
    //   redis.command("PUBLISH", "commands", `${id}:off`);
    // }
  });
});
server.on("listening", () => {
  console.log("commands listening", server.address());
}).listen(7890, "0.0.0.0");
