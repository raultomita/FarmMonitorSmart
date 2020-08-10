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
            <span className="badge badge-success">Connected</span> :
            <span className="badge badge-danger">Disconnected</span>;

        const states = this.state.stations.map((state) => !state.isDead ?
            <span className="badge badge-success heartbeat">{state.name}</span> :
            <span className="badge badge-danger heartbeat">{state.name}</span>)

        return <div className="notificationHeader">
            {content}
            <span className="state">{this.state.status}</span>
            {states}</div>
    }

    connect() {

        let hubConnection = new HubConnectionBuilder().withUrl("/hub").build();

        hubConnection.on("notifications", (value) => {
            let deviceData = JSON.parse(value);
            //notificationsWidget.props.onDeviceReceived(deviceData);
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
