/**
 * Copyright 2019, Google LLC
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *   http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference types="@google/local-home-sdk" />

import { IDiscoveryData } from './types';
import { DOMParser } from 'xmldom';
import cbor from 'cbor';

require('array.prototype.flatmap/auto');

// HomeApp implements IDENTIFY and EXECUTE handler for smarthome local device
// execution.
export class HomeApp {
  constructor(private readonly app: smarthome.App) {
    this.app = app;
  }

  // identifyHandlers decode UDP scan data and structured device information.
  public identifyHandler = async (
    identifyRequest: smarthome.IntentFlow.IdentifyRequest):
    Promise<smarthome.IntentFlow.IdentifyResponse> => {
    console.log(`IDENTIFY request ${JSON.stringify(identifyRequest, null, 2)}`);

    const device = identifyRequest.inputs[0].payload.device;
    const discoveryData: IDiscoveryData = await this.getDiscoveryData(device, identifyRequest.requestId);
    console.log(`discoveryData: ${JSON.stringify(discoveryData, null, 2)}`);

    const identifyResponse: smarthome.IntentFlow.IdentifyResponse = {
      requestId: identifyRequest.requestId,
      intent: smarthome.Intents.IDENTIFY,
      payload: {
        device: {
          id: discoveryData.id,
          isProxy: true,
          isLocalOnly: true
        },
      },
    };

    console.log(`IDENTIFY response ${JSON.stringify(identifyResponse, null, 2)}`);
    return identifyResponse;
  }

  public reachableDevicesHandler = async (
    reachableDevicesRequest: smarthome.IntentFlow.ReachableDevicesRequest):
    Promise<smarthome.IntentFlow.ReachableDevicesResponse> => {
    console.log(`REACHABLE_DEVICES request ${JSON.stringify(reachableDevicesRequest, null, 2)}`);

    const proxyDeviceId = reachableDevicesRequest.inputs[0].payload.device.id;
    const devices = reachableDevicesRequest.devices.flatMap((d) => {
      const customData = d.customData as any;
      if (customData.proxy === proxyDeviceId) {
        return [{ verificationId: d.id }];
      }
      return [];
    });

    const reachableDevicesResponse = {
      intent: smarthome.Intents.REACHABLE_DEVICES,
      requestId: reachableDevicesRequest.requestId,
      payload: {
        devices: devices,
      },
    };

    console.log(`REACHABLE_DEVICES response ${JSON.stringify(reachableDevicesResponse, null, 2)}`);

    return reachableDevicesResponse;
  }

  // executeHandler send openpixelcontrol messages corresponding to light device
  // commands.
  public executeHandler = async (
    executeRequest: smarthome.IntentFlow.ExecuteRequest):
    Promise<smarthome.IntentFlow.ExecuteResponse> => {
    console.log(`EXECUTE request: ${JSON.stringify(executeRequest, null, 2)}`);
    const executeResponse = new smarthome.Execute.Response.Builder().setRequestId(executeRequest.requestId);

    for (const input of  executeRequest.inputs){
      for (const command of input.payload.commands){        
        const execution = command.execution[0];

        for (const device of command.devices){
          
          if (execution.command !== 'action.devices.commands.OnOff') {
            executeResponse.setErrorState(device.id, `Unsupported command: ${execution.command}`);
          }
          else{
            const params = execution.params as any;
            const customData = device.customData as any;
            const deviceCommand = new smarthome.DataFlow.UdpRequestData();
            if(params.on == true){
              deviceCommand.data = Buffer.from(`${device.id}:on`).toString('hex'); 
            }
            else{
              deviceCommand.data = Buffer.from(`${device.id}:off`).toString('hex'); 
            }
            deviceCommand.requestId = executeRequest.requestId;
            deviceCommand.deviceId = device.id;
            deviceCommand.port = customData.port;

            console.log(`${customData.control_protocol} RequestData: `, deviceCommand);

            try {
              const result = await this.app.getDeviceManager().send(deviceCommand);
              const state = {
                online: true,
              };
              executeResponse.setSuccessState(result.deviceId, state);
            } catch (e) {
              executeResponse.setErrorState(device.id, e.errorCode);
            }

          }
        }

      }
    }
   
    console.log(
      `EXECUTE response: ${JSON.stringify(executeResponse, null, 2)}`);
    // Return execution response to smarthome infrastructure.
    return executeResponse.build();
  }

  private getDiscoveryData = async (
    device: smarthome.IntentFlow.LocalIdentifiedDevice,
    requestId: string,
  ): Promise<IDiscoveryData> => {
    if (device.udpScanData !== undefined) { // UDP discovery
      return cbor.decodeFirst(Buffer.from(device.udpScanData.data, 'hex'));
    }

    throw Error(
      `Missing or incorrect scan data for intent requestId ${requestId}`);
  }
}
