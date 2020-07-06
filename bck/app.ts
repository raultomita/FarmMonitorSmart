/**
 * Copyright 2019, Google, Inc.
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

import { IColorAbsolute, IDiscoveryData, ICustomData, IStrandInfo } from "./types";

// TODO(proppy): add typings
const cbor = require("cbor");
const opcStream = require("opc");

// HomeApp implements IDENTIFY and EXECUTE handler for smarthome local device execution.
export class HomeApp {
  constructor(private readonly app: smarthome.App) {
      this.app = app;
  }

  // identifyHandlers decode UDP scan data and structured device information.
  public identifyHandler = async (identifyRequest: smarthome.IntentFlow.IdentifyRequest):
    Promise<smarthome.IntentFlow.IdentifyResponse> => {
    console.log("IDENTIFY request", identifyRequest);
    // TODO(proppy): handle multiple inputs.
    const device = identifyRequest.inputs[0].payload.device;
    if (device.udpScanData === undefined) {
       throw Error(`identify request is missing discovery response: ${identifyRequest}`);
    }
    // Raw discovery data are encoded as 'hex'.
    const udpScanData = Buffer.from(device.udpScanData.data, "hex");
    console.debug("udpScanData:", udpScanData);
    // Device encoded discovery payload in CBOR.
    const discoveryData: IDiscoveryData = await cbor.decodeFirst(udpScanData);
    console.debug("discoveryData:", discoveryData);

    const identifyResponse: smarthome.IntentFlow.IdentifyResponse = {
      intent: smarthome.Intents.IDENTIFY,
      requestId: identifyRequest.requestId,
      payload: {
        device: {
          deviceInfo: {
            manufacturer: "RTO Lights",
            model: discoveryData.model,
            hwVersion: discoveryData.hw_rev,
            swVersion: discoveryData.fw_rev,
          },
          id: discoveryData.id,
          isProxy: true, 
          isLocalOnly: true 
        },
      },
    };
    console.log("IDENTIFY response", identifyResponse);
    return identifyResponse;
  }

  public reachableDevicesHandler = async (reachableDevicesRequest: smarthome.IntentFlow.ReachableDevicesRequest):
    Promise<smarthome.IntentFlow.ReachableDevicesResponse> => {
    console.log("REACHABLE_DEVICES request:", reachableDevicesRequest);

    const proxyDeviceId = reachableDevicesRequest.inputs[0].payload.device.id;
    const devices = [{verificationId: "local-light-id-switch20"},
     {verificationId: "local-light-id-switch19"},
     {verificationId: "local-light-id-switch8"},
     {verificationId: "local-light-id-switch18"},
     {verificationId: "local-light-id-switch5"},
     {verificationId: "local-light-id-switch21"},
     {verificationId: "local-light-id-switch1"},
     {verificationId: "local-light-id-switch22"},
     {verificationId: "local-light-id-switch14"},
     {verificationId: "local-light-id-switch15"},
     {verificationId: "local-light-id-switch2"},
     {verificationId: "local-light-id-switch16"},
     {verificationId: "local-light-id-switch13"},
     {verificationId: "local-light-id-switch7"},
     {verificationId: "local-light-id-switch10"},
     {verificationId: "local-light-id-switch17"},
     {verificationId: "local-light-id-switch11"},
     {verificationId: "local-light-id-switch6"},
     {verificationId: "local-light-id-switch4"},
     {verificationId: "local-light-id-switch9"},
     {verificationId: "local-light-id-switch23"},];
    const reachableDevicesResponse: smarthome.IntentFlow.ReachableDevicesResponse = {
      intent: smarthome.Intents.REACHABLE_DEVICES,
      requestId: reachableDevicesRequest.requestId,
      payload: {
        devices: devices,
      },
    };
    console.log("REACHABLE_DEVICES response", reachableDevicesResponse);
    return reachableDevicesResponse;
  }

  // executeHandler send openpixelcontrol messages corresponding to light device commands.
  public executeHandler = async (executeRequest: smarthome.IntentFlow.ExecuteRequest):
    Promise<smarthome.IntentFlow.ExecuteResponse> => {
    console.log("EXECUTE request:", executeRequest);
    // TODO(proppy): handle multiple inputs/commands.
    const command = executeRequest.inputs[0].payload.commands[0];
    // TODO(proppy): handle multiple executions.
    const execution = command.execution[0];
    if (execution.command !== "action.devices.commands.OnOff") {
      throw Error(`Unsupported command: ${execution.command}`);
    }
    // Create execution response to capture individual command
    // success/failure for each devices.
    const executeResponse =  new smarthome.Execute.Response.Builder()
      .setRequestId(executeRequest.requestId);
    // Handle light device commands for all devices.
    await Promise.all(command.devices.map(async (device) => {
      const params = execution.params as { on:boolean };
      const state = {
        on: params.on,
        online: true,
      };
            
      const deviceCommand = new smarthome.DataFlow.TcpRequestData();
      deviceCommand.requestId = executeRequest.requestId;
      deviceCommand.deviceId = device.id;
      var id = device.id.replace("local-light-id-switch", "")
      const colorBuf = Buffer.alloc(1 * 1);
      if(state.on){
        colorBuf.writeUInt8(0xFF, 0);
      }
      else{
        colorBuf.writeUInt8(0x00, 0);
      }

      const stream = opcStream();
      stream.writePixels(id, colorBuf);
      const opcMessage = stream.read();
      console.log("opcMessage:", opcMessage);
      deviceCommand.data = opcMessage.toString("hex");
      deviceCommand.port = 7890;
      deviceCommand.isSecure = false;
      deviceCommand.operation = smarthome.Constants.TcpOperation.WRITE;
      
      try {
        const result = await this.app.getDeviceManager().send(deviceCommand);
        executeResponse.setSuccessState(result.deviceId, state);
      } catch (e) {
        executeResponse.setErrorState(device.id, e.errorCode);
      }
    }));
    console.log("EXECUTE response", executeResponse);
    // Return execution response to smarthome infrastructure.
    return executeResponse.build();
  }
}
