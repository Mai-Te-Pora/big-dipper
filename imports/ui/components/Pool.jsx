import React, { Component } from 'react';

export default class Order extends Component{
    constructor(props){
        super(props);

        this.state = {
            originator: this.props.originator,
            pool: this.props.pool,
            shares: this.props.shares,
            type: this.props.type,
            amountA: this.props.amountA,
            amountB: this.props.amountB,
            amount: this.props.amount,
            duration: parseFloat(this.props.duration) / 60 / 60 / 24,
            denom: (this.props.denom).toUpperCase(),
        }
    }

    render(){
        switch(parseFloat(this.state.type)) {
            case 1: // claim
                return <span className="order overflow-auto d-inline">
                    on pool {this.state.pool} 
                </span>
            case 2: // remove
                return <span className="order overflow-auto d-inline">
                    of {this.state.shares} on pool {this.state.pool} 
                </span>
            case 3: // add
                return <span className="order overflow-auto d-inline">
                    of {this.state.shares} (Amount A: {this.state.amountA} - Amount B: {this.state.amountB}) on pool {this.state.pool} 
                </span>
            case 4: // stake
                return <span className="order overflow-auto d-inline">
                    of {this.state.amount} for {this.state.duration} days, on {this.state.denom}
                </span>
            default:
                return <span className="order overflow-auto d-inline">
                </span>
        }
    }
}