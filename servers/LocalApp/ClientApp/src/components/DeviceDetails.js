import React, { Component } from 'react';
import { Messages } from './Messages';

export class DeviceDetails extends Component {
    static displayName = DeviceDetails.name;

    render() {
        return <div key={this.props.deviceId} className="deviceDetails card">
            <div className="card-body">
                <h5>{this.props.deviceId}</h5>
                <Messages header="Errors" messages={this.props.messages} />
                {this.props.fields.map(field =>
                    <div key={field.Key} className="fieldDetail">
                        <label >{field.Key}</label>
                        <span >{field.Value}</span>
                    </div>
                )}
            </div>
        </div>;
    }
}
