import React, { Component } from 'react';
import { Messages } from './Messages'
import { DeviceDetails } from './DeviceDetails';

export class Admin extends Component {
    static displayName = Admin.name;

    constructor(props) {
        super(props);
        this.state = { loading: true, systemOverview: null };
    }

    componentDidMount() {
        this.getDevices();
    }

    render() {
        return this.state.loading
            ? <p><em>Loading...</em></p>
            : <div className="systemOverview">
                <h1>System overview</h1>
                <Messages header="System errors" messages={this.state.systemOverview.messages} />
                <p>
                    Supported types CS:
                    {this.state.systemOverview.supportedTypes.map(type =>
                    <span> "{type}" </span>
                )}
                </p>
                <p>
                    Supported locations CS:
                    {this.state.systemOverview.supportedLocations.map(location =>
                    <span> "{location}" </span>
                )}
                </p>

                <div>
                    {this.state.systemOverview.instances.map(instance =>
                        <div className="instancesDetails">
                            <h2>mapped :: {instance.instanceId}</h2>
                            {instance.devices.map(device =>
                                <DeviceDetails {...device} />
                            )}
                        </div>
                    )}
                </div>
                <div className="unmapped">
                    <h2>unmapped :: unknown</h2>
                    {this.state.systemOverview.unmapped.map(device =>
                        <DeviceDetails {...device} />
                    )}
                </div>
            </div>;
    }

    async getDevices() {
        const response = await fetch('admin/get');
        const data = await response.json();
        this.setState({ loading: false, systemOverview: data });
    }
}
