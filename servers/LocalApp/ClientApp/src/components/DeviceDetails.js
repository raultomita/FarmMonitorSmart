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
                    <div className="fieldDetail">
                        <label >{field.item1}</label>
                        <span >{field.item2}</span>
                    </div>
                )}
            </div>
        </div>;
    }
}
