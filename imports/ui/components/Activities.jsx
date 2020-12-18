import React, {Component } from 'react';
import { MsgType } from './MsgType.jsx';
import { Link } from 'react-router-dom';
import Account from '../components/Account.jsx';
import Order from '../components/Order.jsx';
import Pool from '../components/Pool.jsx';
import i18n from 'meteor/universe:i18n';
import Coin from '/both/utils/coins.js'
import JSONPretty from 'react-json-pretty';
import _ from 'lodash';

const T = i18n.createComponent();

MultiSend = (props) => {
    return <div>
        <p><T>activities.single</T> <MsgType type={props.msg.type} /> <T>activities.happened</T></p>
        <p><T>activities.senders</T>
            <ul>
                {props.msg.value.inputs.map((data,i) =>{
                    return <li key={i}><Account address={data.address}/> <T>activities.sent</T> {data.coins.map((coin, j) =>{
                        return <span key={j} className="text-success">{new Coin(coin.amount, coin.denom).toString()}</span>
                    })}
                    </li>
                })}
            </ul>
            <T>activities.receivers</T>
            <ul>
                {props.msg.value.outputs.map((data,i) =>{
                    return <li key={i}><Account address={data.address}/> <T>activities.received</T> {data.coins.map((coin,j) =>{
                        return <span key={j} className="text-success">{new Coin(coin.amount, coin.denom).toString()}</span>
                    })}</li>
                })}
            </ul>
        </p>
    </div>
}

export default class Activites extends Component {
    constructor(props){
        super(props);
    }

    render(){
        console.log(this.props);
        const msg = this.props.msg;
        const events = [];
        for (let i in this.props.events){
            events[this.props.events[i].type] = this.props.events[i].attributes
        }
        
        switch (msg.type){
        // bank
        case "cosmos-sdk/MsgSend":
            let amount = '';
            amount = msg.value.amount.map((coin) => new Coin(coin.amount, coin.denom).toString()).join(', ')
            return <p><Account address={msg.value.from_address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <span className="text-success">{amount}</span> <T>activities.to</T> <span className="address"><Account address={msg.value.to_address} /></span><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgMultiSend":
            return <MultiSend msg={msg} />

            // staking
        case "cosmos-sdk/MsgCreateValidator":
            return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <T>activities.operatingAt</T> <span className="address"><Account address={msg.value.validator_address}/></span> <T>activities.withMoniker</T> <Link to="#">{msg.value.description.moniker}</Link><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgEditValidator":
            return <p><Account address={msg.value.address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /></p>
        case "cosmos-sdk/MsgDelegate":
            return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <span className="text-warning">{new Coin(msg.value.amount.amount, msg.value.amount.denom).toString(8)}</span> <T>activities.to</T> <Account address={msg.value.validator_address} /><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgUndelegate":
            return <p><Account address={msg.value.delegator_address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <span className="text-warning">{new Coin(msg.value.amount.amount, msg.value.amount.denom).toString(8)}</span> <T>activities.from</T> <Account address={msg.value.validator_address} /><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgBeginRedelegate":
            return <p><Account address={msg.value.delegator_address} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <span className="text-warning">{new Coin(msg.value.amount.amount, msg.value.amount.denom).toString(8)}</span> <T>activities.from</T> <Account address={msg.value.validator_src_address} /> <T>activities.to</T> <Account address={msg.value.validator_dst_address} /><T>common.fullStop</T></p>

            // gov
        case "cosmos-sdk/MsgSubmitProposal":
            const proposalId = _.get(this.props, 'events[2].attributes[0].value', null)
            const proposalLink = proposalId ? `/proposals/${proposalId}` : "#";
            return <p><Account address={msg.value.proposer} /> <MsgType type={msg.type} /> <T>activities.withTitle</T> <Link to={proposalLink}>{msg.value.content.value.title}</Link><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgDeposit":
            return <p><Account address={msg.value.depositor} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> <em className="text-info">{msg.value.amount.map((amount,i) =>new Coin(amount.amount, amount.denom).toString(8)).join(', ')}</em> <T>activities.to</T> <Link to={"/proposals/"+msg.value.proposal_id}><T>proposals.proposal</T> {msg.value.proposal_id}</Link><T>common.fullStop</T></p>
        case "cosmos-sdk/MsgVote":
            return <p><Account address={msg.value.voter} /> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} />  <Link to={"/proposals/"+msg.value.proposal_id}><T>proposals.proposal</T> {msg.value.proposal_id}</Link> <T>activities.withA</T> <em className="text-info">{msg.value.option}</em><T>common.fullStop</T></p>

            // distribution
        case "cosmos-sdk/MsgWithdrawValidatorCommission":
            console.log('events')
            console.log(events)
        
            if (events['withdraw_commission'][0] && events['withdraw_commission'][0].value) {
                const valueAmounts = events['withdraw_commission'][0].value
                const valueAmountsArr = valueAmounts.split(',')
                switch(valueAmountsArr.length) {
                    default:
                        return <p><Account address={msg.value.validator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[0]), valueAmountsArr[0]?valueAmountsArr[0].replace(/[0-9]/g, ''):valueAmountsArr[0]).toString(8)}>activities.ofAmount</T>:''}common.fullStop</T></p>
                    case 1:
                        return <p><Account address={msg.value.validator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[0]), valueAmountsArr[0]?valueAmountsArr[0].replace(/[0-9]/g, ''):valueAmountsArr[0]).toString(8)}>activities.ofAmount</T>:''}common.fullStop</T></p>
                    case 2:
                        return <p><Account address={msg.value.validator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[0]), valueAmountsArr[0]?valueAmountsArr[0].replace(/[0-9]/g, ''):valueAmountsArr[0]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[1]), valueAmountsArr[1]?valueAmountsArr[1].replace(/[0-9]/g, ''):valueAmountsArr[1]).toString(8)}>activities.ofAmount</T>:''}common.fullStop</T></p>
                    case 3:
                        return <p><Account address={msg.value.validator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[0]), valueAmountsArr[0]?valueAmountsArr[0].replace(/[0-9]/g, ''):valueAmountsArr[0]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[1]), valueAmountsArr[1]?valueAmountsArr[1].replace(/[0-9]/g, ''):valueAmountsArr[1]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[2]), valueAmountsArr[2]?valueAmountsArr[2].replace(/[0-9]/g, ''):valueAmountsArr[2]).toString(8)}>activities.ofAmount</T>:''}common.fullStop</T></p>
                    case 4:
                        return <p><Account address={msg.value.validator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[0]), valueAmountsArr[0]?valueAmountsArr[0].replace(/[0-9]/g, ''):valueAmountsArr[0]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[1]), valueAmountsArr[1]?valueAmountsArr[1].replace(/[0-9]/g, ''):valueAmountsArr[1]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[2]), valueAmountsArr[2]?valueAmountsArr[2].replace(/[0-9]/g, ''):valueAmountsArr[2]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[3]), valueAmountsArr[3]?valueAmountsArr[3].replace(/[0-9]/g, ''):valueAmountsArr[3]).toString(8)}>activities.ofAmount</T>:''}common.fullStop</T></p>
                    case 5:
                        return <p><Account address={msg.value.validator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[0]), valueAmountsArr[0]?valueAmountsArr[0].replace(/[0-9]/g, ''):valueAmountsArr[0]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[1]), valueAmountsArr[1]?valueAmountsArr[1].replace(/[0-9]/g, ''):valueAmountsArr[1]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[2]), valueAmountsArr[2]?valueAmountsArr[2].replace(/[0-9]/g, ''):valueAmountsArr[2]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[3]), valueAmountsArr[3]?valueAmountsArr[3].replace(/[0-9]/g, ''):valueAmountsArr[3]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[4]), valueAmountsArr[4]?valueAmountsArr[4].replace(/[0-9]/g, ''):valueAmountsArr[4]).toString(8)}>activities.ofAmount</T>:''}common.fullStop</T></p>
                }
            }
        
        case "cosmos-sdk/MsgWithdrawDelegationReward":
            console.log('events')
            console.log(events)
            
            if (events['withdraw_rewards'][0] && events['withdraw_rewards'][0].value) {
                const valueAmounts = events['withdraw_rewards'][0].value
                const valueAmountsArr = valueAmounts.split(',')
                switch(valueAmountsArr.length) {
                    default:
                        return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[0]), valueAmountsArr[0]?valueAmountsArr[0].replace(/[0-9]/g, ''):valueAmountsArr[0]).toString(8)}>activities.ofAmount</T>:''} <T>activities.from</T> <Account address={msg.value.validator_address} /><T>common.fullStop</T></p>
                    case 1:
                        return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[0]), valueAmountsArr[0]?valueAmountsArr[0].replace(/[0-9]/g, ''):valueAmountsArr[0]).toString(8)}>activities.ofAmount</T>:''} <T>activities.from</T> <Account address={msg.value.validator_address} /><T>common.fullStop</T></p>
                    case 2:
                        return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[0]), valueAmountsArr[0]?valueAmountsArr[0].replace(/[0-9]/g, ''):valueAmountsArr[0]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[1]), valueAmountsArr[1]?valueAmountsArr[1].replace(/[0-9]/g, ''):valueAmountsArr[1]).toString(8)}>activities.ofAmount</T>:''} <T>activities.from</T> <Account address={msg.value.validator_address} /><T>common.fullStop</T></p>
                    case 3:
                        return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[0]), valueAmountsArr[0]?valueAmountsArr[0].replace(/[0-9]/g, ''):valueAmountsArr[0]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[1]), valueAmountsArr[1]?valueAmountsArr[1].replace(/[0-9]/g, ''):valueAmountsArr[1]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[2]), valueAmountsArr[2]?valueAmountsArr[2].replace(/[0-9]/g, ''):valueAmountsArr[2]).toString(8)}>activities.ofAmount</T>:''}<T>activities.from</T> <Account address={msg.value.validator_address} /><T>common.fullStop</T></p>
                    case 4:
                        return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[0]), valueAmountsArr[0]?valueAmountsArr[0].replace(/[0-9]/g, ''):valueAmountsArr[0]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[1]), valueAmountsArr[1]?valueAmountsArr[1].replace(/[0-9]/g, ''):valueAmountsArr[1]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[2]), valueAmountsArr[2]?valueAmountsArr[2].replace(/[0-9]/g, ''):valueAmountsArr[2]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[3]), valueAmountsArr[3]?valueAmountsArr[3].replace(/[0-9]/g, ''):valueAmountsArr[3]).toString(8)}>activities.ofAmount</T>:''} <T>activities.from</T> <Account address={msg.value.validator_address} /><T>common.fullStop</T></p>
                    case 5:
                        return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /> {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[0]), valueAmountsArr[0]?valueAmountsArr[0].replace(/[0-9]/g, ''):valueAmountsArr[0]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[1]), valueAmountsArr[1]?valueAmountsArr[1].replace(/[0-9]/g, ''):valueAmountsArr[1]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[2]), valueAmountsArr[2]?valueAmountsArr[2].replace(/[0-9]/g, ''):valueAmountsArr[2]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[3]), valueAmountsArr[3]?valueAmountsArr[3].replace(/[0-9]/g, ''):valueAmountsArr[3]).toString(8)}>activities.ofAmount</T>:''} and {(!this.props.invalid)?<T _purify={false} amount={new Coin(parseInt(valueAmountsArr[4]), valueAmountsArr[4]?valueAmountsArr[4].replace(/[0-9]/g, ''):valueAmountsArr[4]).toString(8)}>activities.ofAmount</T>:''} <T>activities.from</T> <Account address={msg.value.validator_address} /><T>common.fullStop</T></p>
                }
            }
            
        case "cosmos-sdk/MsgModifyWithdrawAddress":
            return <p><Account address={msg.value.delegator_address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /></p>

            // slashing
        case "cosmos-sdk/MsgUnjail":
            return <p><Account address={msg.value.address}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T>common.fullStop</T></p>

            // ibc
        case "cosmos-sdk/IBCTransferMsg":
            return <MsgType type={msg.type} />
        case "cosmos-sdk/IBCReceiveMsg":
            return <MsgType type={msg.type} />

            // tradehub
        case "ccm/MsgProcessCrossChainTx":
            switch(parseFloat(msg.value.FromChainId)) {
                case 2:
                    return <p>Cross-Chain Transaction from NEO</p>
                case 4:
                    return <p>Cross-Chain Transaction from Ethereum</p> 
                default:
                    return <p>Cross-Chain Transaction from Ethereum</p> 
            }
        case "coin/MsgWithdraw":
            return <p><Account address={msg.value.originator}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T> {(!this.props.invalid)?`${msg.value.amount} ${msg.value.denom}`:''}common.fullStop</T></p>     

        case "profile/MsgUpdateProfile":
            return <p><Account address={msg.value.originator}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T> {(!this.props.invalid)?`with a username of ${msg.value.username}`:''}common.fullStop</T></p>     
        case "order/MsgCreateOrder":
            return <p><Account address={msg.value.originator}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T> {(!this.props.invalid)?<Order address={msg.value.originator} market={msg.value.market} price={msg.value.price} quantity={msg.value.quantity} side={msg.value.side} type={msg.value.type}/>:''}common.fullStop</T></p>     
        case "order/MsgCancelOrder":
            return <p><Account address={msg.value.originator}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T> {(!this.props.invalid)?'':''}common.fullStop</T></p>     
        
        case "liquiditypool/ClaimPoolRewards":
            return <p><Account address={msg.value.originator}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T> {(!this.props.invalid)?<Pool address={msg.value.originator} pool={msg.value.pool_id} type="1"/>:''}common.fullStop</T></p>     
        case "liquiditypool/RemoveLiquidity":
            return <p><Account address={msg.value.originator}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T> {(!this.props.invalid)?<Pool address={msg.value.originator} pool={msg.value.pool_id} shares={msg.value.shares} type="2"/>:''}common.fullStop</T></p>     
        case "liquiditypool/AddLiquidity":
            return <p><Account address={msg.value.originator}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T> {(!this.props.invalid)?<Pool address={msg.value.originator} pool={msg.value.pool_id} shares={msg.value.min_shares} amountA={msg.value.amount_a} amountB={msg.value.amount_b} type="3"/>:''}common.fullStop</T></p>     
        case "liquiditypool/StakePoolToken":
            return <p><Account address={msg.value.originator}/> {(this.props.invalid)?<T>activities.failedTo</T>:''}<MsgType type={msg.type} /><T> {(!this.props.invalid)?<Pool address={msg.value.originator} pool={msg.value.pool_id} amount={msg.value.amount} duration={msg.value.duration} denom={msg.value.denom} type="4"/>:''}common.fullStop</T></p>     
        
        default:
            return <div><JSONPretty id="json-pretty" data={msg.value}></JSONPretty></div>
        }
    }
}