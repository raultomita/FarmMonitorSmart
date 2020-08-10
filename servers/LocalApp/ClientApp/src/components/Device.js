import React, { Component } from 'react';

export class Device extends Component {
    static displayName = Device.name;

    constructor(props) {
        super(props);
        this.state = { isBusy: false };
        this.changeState = this.changeState.bind(this);
    }

    changeState() {
        this.setState({ isBusy: true });
        fetch('/api/devices/' + this.props.id, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
    }

    render() {
        let actionIcon = this.state.isBusy ? <i className="fa fa-circle-o-notch fa-spin fa-lg"></i> : <i className="fa fa-power-off fa-lg"></i>;
        let className = this.props.state == "1" ? "btn btn-success deviceTrigger " : "btn btn-outline-success deviceTrigger ";
        className += this.props.location;

        let locationIcon = this.props.location == "Bedroom" ? <i className="fa fa-bed" aria-hidden="true"></i> :
            this.props.location == "Bathroom" ? <i className="fa fa-bath" aria-hidden="true"></i> :
                this.props.location == "Kitchen" ? <i className="fa fa-cutlery" aria-hidden="true"></i> :
                    this.props.location == "Living-room" ? <i className="fa fa-television" aria-hidden="true"></i> :
                        this.props.location == "Lobby" ? <i className="fa fa-archive" aria-hidden="true"></i> :
                            <i> </i>;

        let seconds = Math.floor((Date.now() - Date.parse(this.props.timeStamp)) / 1000);
        let timeStampMessage = seconds < 60 ? seconds + " sec ago" :
            seconds < 3600 ? Math.floor(seconds / 60) + " min ago" :
                seconds < 86400 ? Math.floor(seconds / 3600) + " hour ago" : Math.floor(seconds / 86400) + " day ago";


        return <div className={className} onClick={this.changeState}>
            <div className="location">{locationIcon}</div>
            <div className="deviceName">{this.props.display}</div>
            <div className="content">{actionIcon}</div>
            <div className="timeStamp">{timeStampMessage}</div>
        </div>;  
    }
}
