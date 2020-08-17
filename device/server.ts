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
import dgram from 'dgram';
import yargs from 'yargs';

const argv =
    yargs.usage('Usage: $0  --device_id ID --udp_discovery_port number udp_discovery_packet hex')  
        .option('device_id', {
          describe: 'device id to return in the discovery response',
          type: 'string',
          demandOption: true,
        })             
        .option('udp_discovery_port', {
          describe: 'port to listen on for UDP discovery query',
          type: 'number',
          demandOption: true,
        })
        .option('udp_discovery_packet', {
          describe:
              'hex encoded packet content to match for UDP discovery query',
          type: 'string',
          default: 'A5A5A5A5',
        })     
        .argv;

function makeDiscoveryData() {
  const discoveryData = {
    id: argv.device_id
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