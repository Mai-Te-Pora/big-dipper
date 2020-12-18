import React, { Component } from 'react';

export default class Order extends Component{
    constructor(props){
        super(props);

        this.state = {
            originator: this.props.originator,
            pool: this.props.pool_id,
            shares: this.props.shares,
            type: this.props.type
        }
    }

    render(){
        switch(parseFloat(this.state.type)) {
            case 1:
                return <span className="order overflow-auto d-inline">
                    on pool {this.state.pool} 
                </span>
            case 2:
                return <span className="order overflow-auto d-inline">
                    of {this.state.shares} on pool {this.state.pool} 
                </span>
            case 3:
                return <span className="order overflow-auto d-inline">
                    of {this.state.shares} on pool {this.state.pool} 
                </span>
            default:
                return <span className="order overflow-auto d-inline">
                    on pool {this.state.pool} 
                </span>
        }
    }
}