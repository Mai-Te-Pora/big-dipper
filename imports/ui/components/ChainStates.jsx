import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';
import { Card, CardHeader, Row, Col } from 'reactstrap';
import numbro from 'numbro';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js'

const T = i18n.createComponent();


export default class ChainStates extends Component{
    constructor(props){
        super(props);
        this.state = {
            price: "-",
            marketCap: "-",
            height: "-",
            bonded: "-",
            inflation: "-",
            communityPool: [],
        }
        const powerReduction = Meteor.settings.public.powerReduction || Coin.StakingCoin.fraction;

        if (Meteor.isServer){

            if (this.props.chainStates.communityPool){
                let commPool = []
                this.props.chainStates.communityPool.forEach((pool, i) => {
                    commPool[i] = pool;
                },)
                        this.setState({
                            communityPool: [... commPool],
                            inflation: numbro(this.props.chainStates.inflation).format("0.000%")
                        })
            }

            if (this.props.coinStats.usd){
                this.setState({
                    price: (this.props.coinStats.usd).toFixed(4),
                    marketCap: numbro(Math.round(this.props.coinStats.usd_market_cap)).format("$0,0")
                })
            }

            if (this.props.chainStates.height){
                this.setState({
                    height: numbro((this.props.chainStates.height)).format("0,0")
                })
            }

            if (this.props.chainStates.bondedTokens){
                this.setState({
                    bonded: numbro((Math.round(this.props.chainStates.bondedTokens / powerReduction))).format("0,0.000a")
                })
            }

        }

    }

    componentDidUpdate(prevProps){
        let communityPools = []
        const powerReduction = Meteor.settings.public.powerReduction || Coin.StakingCoin.fraction;
        if (this.props.chainStates != prevProps.chainStates){
            if (this.props.chainStates.communityPool){
                this.props.chainStates.communityPool.forEach((pool, i) => {
                    communityPools[i] = pool;
                },)
                        this.setState({
                            communityPool: [... communityPools],
                            inflation: numbro(this.props.chainStates.inflation).format("0.000%")
                        })
            }

            if (this.props.chainStates.height){
                this.setState({
                    height: numbro((this.props.chainStates.height)).format("0,0")
                })
            }

            if (this.props.chainStates.bondedTokens){
                this.setState({
                    bonded: numbro((Math.round(this.props.chainStates.bondedTokens / powerReduction))).format("0,0.000a")
                })
            }
        }

        if (this.props.coinStats != prevProps.coinStats){
            if (this.props.coinStats.usd){
                this.setState({
                    price: (this.props.coinStats.usd).toFixed(4),
                    marketCap: numbro(Math.round(this.props.coinStats.usd_market_cap)).format("$0,0")
                })
            }
        }

    }


    renderValues(propsValue){
            let poolValues = [];
            propsValue.map((pool,i) => {
                poolValues[i] = new Coin(Math.round(pool.amount), pool.denom).toStringPool()
                // poolValues[i] = new Coin(Math.round(pool.amount), pool.denom).toString()
                    })

            return poolValues.join(', ')

    }
    render(){


        return <Card className="d-lg-inline-block">
            <CardHeader>
                <Row className="header-stats text-nowrap">
                    <Col xs={6} md="auto"><small><span><T>chainStates.price</T>:</span> <strong>${this.state.price}</strong></small></Col>
                    <Col xs={6} md="auto"><small><span><T>chainStates.communityPool</T>:</span> <strong>{(this.renderValues(this.state.communityPool))}</strong></small></Col>
                    {/*<Col xs={6} md="auto"><small><span><T>chainStates.height</T>:</span> <strong>#{this.state.height}</strong></small></Col>*/}
                    <Col xs={6} md="auto"><small><span><T>chainStates.bondedTokens</T>:</span> <strong>{this.state.bonded}</strong></small></Col>
                    <Col xs={6} md="auto"><small><span><T>chainStates.inflation</T>:</span> <strong>{this.state.inflation}</strong></small></Col>
                </Row>
            </CardHeader>
        </Card>
    }
}
