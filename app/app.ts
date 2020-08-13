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

import {ControlKind} from '../common/discovery';
import {IColorAbsolute, ICustomData, IDiscoveryData} from './types';

import {DOMParser} from 'xmldom';
import cbor from 'cbor';

/* tslint:disable:no-var-requires */
// TODO(proppy): add typings
require('array.prototype.flatmap/auto');
const opcStream = require('opc');
/* tslint:enable:no-var-requires */

// HomeApp implements IDENTIFY and EXECUTE handler for smarthome local device
// execution.
export class HomeApp {
  constructor(private readonly app: smarthome.App) {
    this.app = app;
  }

  // identifyHandlers decode UDP scan data and structured device information.
  public identifyHandler = async(identifyRequest: smarthome.IntentFlow.IdentifyRequest):
      Promise<smarthome.IntentFlow.IdentifyResponse> => {
        console.log(`IDENTIFY request ${JSON.stringify(identifyRequest, null, 2)}`);
      

        const identifyResponse: smarthome.IntentFlow.IdentifyResponse = {
          requestId: identifyRequest.requestId,
          intent: smarthome.Intents.IDENTIFY,
          payload: {
            device: {}
          },
        };
        console.log(`IDENTIFY response ${JSON.stringify(identifyResponse, null, 2)}`);
        return identifyResponse;
      }

  // executeHandler send openpixelcontrol messages corresponding to light device
  // commands.
  public executeHandler = async(executeRequest: smarthome.IntentFlow.ExecuteRequest): 
    Promise<smarthome.IntentFlow.ExecuteResponse> => {
        
        console.log(`EXECUTE request: ${JSON.stringify(executeRequest, null, 2)}`);

        const executeResponse = new smarthome.Execute.Response.Builder().setRequestId(executeRequest.requestId);
        
        console.log(
            `EXECUTE response: ${JSON.stringify(executeResponse, null, 2)}`);
        // Return execution response to smarthome infrastructure.
        return executeResponse.build();
      }
}
