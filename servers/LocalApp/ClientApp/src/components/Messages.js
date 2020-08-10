import React, { Component } from 'react';

export class Messages extends Component {
    static displayName = Messages.name;

    render() {
        return this.props.messages.length > 0 ?
            <div className="messagesHeader alert alert-danger">

                {this.props.messages.map(message =>
                    <span>{message}</span>
                )}

            </div> :
            <div></div>;
    }
}
