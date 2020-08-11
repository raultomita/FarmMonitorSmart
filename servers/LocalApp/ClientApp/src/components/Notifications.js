import React, { Component } from 'react';
import { HubConnectionBuilder } from "@aspnet/signalr";
import * as cx from 'classnames'

export class Notifications extends Component {
    static displayName = Notifications.name;

    constructor(props) {
        super(props);
        this.state = {
            isConnected: false,
            isBusy: false,
            status: "",
            stations: []
        };

        this.connect = this.connect.bind(this);
        this.turnAllOff = this.turnAllOff.bind(this);
    }

    componentDidMount() {
        this.connect();
    }

    static getDerivedStateFromProps(props, state) {
        return { ...state, isBusy: false };
    }

    connect() {
        let hubConnection = new HubConnectionBuilder().withUrl("/hub").build();

        hubConnection.on("notifications", (value) => {
            let deviceData = JSON.parse(value);
            this.props.onDeviceReceived(deviceData);
        });

        hubConnection.on("heartbeats", (value) => {
            console.log(value);
            this.setState({ stations: value });
        })

        hubConnection.onclose(err => this.setState({ isConnected: false, status: "Closed" }));

        hubConnection.start()
            .then(v => this.setState({ isConnected: true, status: "" }))
            .catch(err => this.setState({ isConnected: false, status: err.toString() }));
    }

    turnAllOff() {
        this.setState({ isBusy: true });

        fetch('/devices/put/all:off', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
    }

    render() {
        const connClass = cx({
            "powerButton": true,
            "fa fa-power-off": !this.state.isBusy,
            "fa fa-sync fa-spin": this.state.isBusy,
            "badge-success": this.state.isConnected,
            "badge-danger": !this.state.isConnected
        });

        const states = this.state.stations.map((state) => {
            const stateClass = cx({
                "badge": true,
                "badge-success": !state.isDead,
                "badge-danger": state.isDead,
                "heartbeat": true
            });

            return <span key={state.name} className={stateClass} title={state.latestDate}>{state.name}</span>;
        })

        return <div className="notificationHeader">
            {states}
            <span className="state">{this.state.status}</span>
            <span className={connClass} onClick={this.turnAllOff}></span>
        </div>
    }
}
