import React, { Component } from 'react';

export class FilterButton extends Component {
    static displayName = FilterButton.name;

    constructor(props) {
        super(props);
        this.filter = this.filter.bind(this);
    }

    filter() {
        this.props.onClick(this.props.type);
    }

    render() {
        let buttonClassName = "btn btn-outline-dark " + this.props.type;

        if (this.props.state === this.props.type) {
            buttonClassName += " active";
        }

        let symbolClassName = "fa " + this.props.symbol;

        return <button className={buttonClassName} onClick={this.filter}><i className={symbolClassName} aria-hidden="true"></i> </button>;
    }
}
