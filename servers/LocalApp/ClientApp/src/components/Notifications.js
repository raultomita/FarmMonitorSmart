import React, { Component } from 'react';
import { HubConnectionBuilder } from "@aspnet/signalr";

export class Notifications extends Component {
    static displayName = Notifications.name;

    constructor(props) {
        super(props);
        this.state = {
            isConnected: false,
            status: "",
            stations: []
        };

        this.connect = this.connect.bind(this);
    }

    componentDidMount() {
        this.connect();
    }

    render() {
        const content = this.state.isConnected ?
            <span className="badge-success fa fa-power-off"></span> :
            <span className="badge-danger fa fa-power-off"></span>;

        const states = this.state.stations.map((state) => !state.isDead ?
            <span key={state.name+"ok"} className="badge badge-success heartbeat" title={state.latestDate}>{state.name}</span> :
            <span key={state.name+"fail"} className="badge badge-danger heartbeat" title={state.latestDate}>{state.name}</span>)

        return <div className="notificationHeader">
            {states}            
            <span className="state">{this.state.status}</span>
            {content}
        </div>
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
}
