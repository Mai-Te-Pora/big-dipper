import React, { Component } from 'react';

export default class Order extends Component{
    constructor(props){
        super(props);

        this.state = {
            originator: this.props.originator,
            market: (this.props.market).toUpperCase(),
            price: this.props.price,
            quantity: this.props.quantity,
            side: this.props.side,
            type: this.props.type
        }
    }

    render(){
        return <span className="order overflow-auto d-inline">
            {this.state.type} {this.state.side} on {this.state.market}, quantity: {this.state.quantity}, price: {this.state.price} 
        </span>
    }
}