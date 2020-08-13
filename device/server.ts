/**
 * Copyright 2019, Google LLC
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

import cbor from 'cbor';
import chalk from 'chalk';
import dgram from 'dgram';
import express from 'express';
import net from 'net';
import {Readable} from 'stream';
import yargs from 'yargs';

import {IOPCMessage} from './types';

const opcParser = require('opc/parser');
const opcStrand = require('opc/strand');

const argv =
    yargs.usage('Usage: $0  --device_id ID [protocol settings]')               
        .option('udp_discovery_port', {
          describe: 'port to listen on for UDP discovery query',
          type: 'number',
          default: 3311,
        })
        .option('udp_discovery_packet', {
          describe:
              'hex encoded packet content to match for UDP discovery query',
          type: 'string',
          default: 'A5A5A5A5',
        })
        .option('device_id', {
          describe: 'device id to return in the discovery response',
          type: 'string',
          demandOption: true,
        })       
        .argv;

function makeDiscoveryData() {
  const discoveryData = {
    id: argv.device_id,
    model: argv.device_model,
    hw_rev: argv.hardware_revision,
    fw_rev: argv.firmware_revision,
    channels: argv.channel,
  };
  return discoveryData;
}

export function startUdpDiscovery() {
  const discoveryPacket = Buffer.from(argv.udp_discovery_packet, 'hex');
  const socket = dgram.createSocket('udp4');
  // Handle discovery request.
  socket.on('message', (msg, rinfo) => {
    if (msg.compare(discoveryPacket) !== 0) {
      console.warn('UDP received unknown payload:', msg, 'from:', rinfo);
      return;
    }
    console.debug('UDP received discovery payload:', msg, 'from:', rinfo);
    // Reply to discovery request with device parameters encoded in CBOR.
    // note: any encoding/properties could be used as long as the app-side can
    // interpret the payload.
    const discoveryData = makeDiscoveryData();
    const responsePacket = cbor.encode(discoveryData);
    socket.send(responsePacket, rinfo.port, rinfo.address, (error) => {
      if (error !== null) {
        console.error('UDP failed to send ack:', error);
        return;
      }
      console.debug(
          'UDP sent discovery response:', responsePacket, 'to:', rinfo);
    });
  });
  socket.on('listening', () => {
    console.log('UDP discovery listening', socket.address());
  });
  socket.bind(argv.udp_discovery_port);
}

// Default strands color is white.
const strands = new Map(
    argv.channel.map(
        (c) => [c, opcStrand(Buffer.alloc(argv.led_count * 3).fill(0xff))]),
);

export function startUdpControl() {
  const server = dgram.createSocket('udp4');
  server.on('message', (msg: Buffer, rinfo: dgram.RemoteInfo) => {
    console.debug(`UDP: from ${rinfo.address} got`, msg);

    const readable = new Readable();
    // tslint:disable-next-line: no-empty
    readable._read = () => {};
    readable.push(msg);
    readable.pipe(opcParser()).on('data', handleOpcMessage);
  });
  server.on('listening', () => {
    console.log(`UDP control listening on port ${argv.opc_port}`);
  });
  server.bind(argv.opc_port);
}

function handleOpcMessage(message: IOPCMessage) {
  console.debug('received command:', message.command, message.data);
  switch (message.command) {
    case 0:  // set-pixel-color
      // TODO(proppy): implement channel 0 broadcast
      if (!strands.has(message.channel)) {
        console.warn('unknown OPC channel:', message.command);
        return;
      }
      strands.set(message.channel, opcStrand(message.data));
      // Display updated strands to the console.
      for (const [c, strand] of strands) {
        for (let i = 0; i < strand.length; i++) {
          const pixel = strand.getPixel(i);
          process.stdout.write(chalk.rgb(
              pixel[0],
              pixel[1],
              pixel[2],
              )(argv.led_char));
        }
        process.stdout.write('\n');
      }
      break;
    default:
      console.warn('Unsupported OPC command:', message.command);
      return;
  }
}
