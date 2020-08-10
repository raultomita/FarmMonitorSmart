import React, { Component } from 'react';
import { FilterButton } from './FilterButton';
import { DeviceButton } from './DeviceButton';
import { Notifications } from './Notifications'

export class Home extends Component {
    static displayName = Home.name;

    constructor(props) {
        super(props);
        this.state = { loading: true, devices: [], filteredDevices: [], activeDevices: [], activeFilter: "All" };
        this.updateDevice = this.updateDevice.bind(this);
        this.resetFilter = this.resetFilter.bind(this);
        this.filter = this.filter.bind(this);
    }

    updateDevice(device) {
        let currentDevices = this.state.devices.map(d => d.id === device.id ? device : d);
        let currentFilteredDevices = this.state.filteredDevices.map(d => d.id === device.id ? device : d);
        this.setState({ devices: currentDevices, filteredDevices: currentFilteredDevices, activeDevices: currentFilteredDevices.filter(d => d.state === "1"), });
    }

    resetFilter() {
        this.setState({ filteredDevices: this.state.devices, activeDevices: this.state.devices.filter(d => d.state === "1"), activeFilter: "All" });
    }

    filter(type) {
        var filteredDevices = this.state.devices.filter(d => d.location === type);
        this.setState({ filteredDevices: filteredDevices, activeDevices: filteredDevices.filter(d => d.state === "1"), activeFilter: type });
    }

    componentDidMount() {
        this.getDevices();
    }

    render() {
        return this.state.loading
            ? <p><em>Loading...</em></p>
            : <div className="deviceCollection">
                <Notifications onDeviceReceived={this.updateDevice} />
                <div className="filterDevices">
                    <FilterButton type="All" onClick={this.resetFilter} symbol="fa-th-large" state={this.state.activeFilter} />
                    <FilterButton type="Bedroom" onClick={this.filter} symbol="fa-bed" state={this.state.activeFilter} />
                    <FilterButton type="Bathroom" onClick={this.filter} symbol="fa-bath" state={this.state.activeFilter} />
                    <FilterButton type="Kitchen" onClick={this.filter} symbol="fa-utensils" state={this.state.activeFilter} />
                    <FilterButton type="Living-room" onClick={this.filter} symbol="fa-tv" state={this.state.activeFilter} />
                    <FilterButton type="Lobby" onClick={this.filter} symbol="fa-archive" state={this.state.activeFilter} />
                </div>

                {this.state.activeDevices.length > 0 ?
                    <div className="activeDevices">
                        {this.state.activeDevices.map(device =>
                            <DeviceButton key={device.id} {...device} isActive={true} />
                        )}
                    </div> :
                    ""}

                {this.state.filteredDevices.map(device =>
                    <div key={device.id} className="deviceWrapper">
                        <DeviceButton {...device} />
                    </div>
                )}
            </div>;    }

    async getDevices() {
        const response = await fetch('devices/get');
        const data = await response.json();
        const sortedDevices = data.sort(this.deviceComparer);

        this.setState({
            devices: sortedDevices,
            filteredDevices: sortedDevices,
            activeDevices: sortedDevices.filter(d => d.state === "1"),
            loading: false
        });
    }

    deviceComparer(first, second) {
        if (first.location > second.location) {
            return 1;
        }

        else if (first.location > second.location) {
            return -1;
        }
        else {
            return 0;
        }
    }

}
