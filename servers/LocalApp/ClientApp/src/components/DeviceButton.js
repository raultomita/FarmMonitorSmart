import React, { Component } from 'react';

export class DeviceButton extends Component {
    static displayName = DeviceButton.name;

    constructor(props) {
        super(props);
        this.state = { isBusy: false };
        this.changeState = this.changeState.bind(this);
    }

    changeState() {
        this.setState({ isBusy: true });
        fetch('/devices/put/' + this.props.id, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
    }

    static getDerivedStateFromProps(props, state) {
        return { isBusy: false };
    }

    render() {
        let actionIcon = this.state.isBusy ? <i className="fas fa-sync fa-spin fa-lg"></i> : <i className="fa fa-power-off fa-lg"></i>;
        let className = " "
        if (!this.props.isActive) {
            className = this.props.state === "1" ? "btn btn-success deviceTrigger " : "btn btn-outline-success deviceTrigger ";
        }
        else {
            className = "btn btn-outline-success activeDevice ";
        }

        className += this.props.location;

        const locationIcon = this.props.location === "Bedroom" ? "fa fa-bed" :
            this.props.location === "Bathroom" ? "fa fa-bath" :
                this.props.location === "Kitchen" ? "fa fa-utensils" :
                    this.props.location === "Living-room" ? "fa fa-tv" :
                        this.props.location === "Lobby" ? "fa fa-archive" :
                            "";

        let seconds = Math.floor((Date.now() - Date.parse(this.props.timeStamp)) / 1000);
        let timeStampMessage = seconds < 60 ? seconds + " sec ago" :
            seconds < 3600 ? Math.floor(seconds / 60) + " min ago" :
                seconds < 86400 ? Math.floor(seconds / 3600) + " hour ago" : Math.floor(seconds / 86400) + " day ago";

        if (!this.props.isActive) {
            return <div className={className} onClick={this.changeState}>
                <div className="location"><i className={locationIcon} aria-hidden="true"></i></div>
                <div className="deviceName">{this.props.display}</div>
                <div className="content">{actionIcon}</div>
                <div className="timeStamp">{timeStampMessage}</div>
            </div>;
        }
        else {
            return <div className={className} onClick={this.changeState}>
                <div className="location"><i className={locationIcon} aria-hidden="true"></i></div>
                <div className="deviceName">{this.props.display}</div>    
        </div>;  
        }
    }
}
