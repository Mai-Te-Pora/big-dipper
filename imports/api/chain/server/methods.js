import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { getAddress } from 'tendermint/lib/pubkey.js';
import { Chain, ChainStates } from '../chain.js';
import { Validators } from '../../validators/validators.js';
import { VotingPowerHistory } from '../../voting-power/history.js';
import Coin from '../../../../both/utils/coins.js';

findVotingPower = (validator, genValidators) => {
    for (let v in genValidators){
        if (validator.pub_key.value == genValidators[v].pub_key.value){
            return parseInt(genValidators[v].power);
        }
    }
}

Meteor.methods({
    'chain.getConsensusState': function(){
        this.unblock();
        let url = RPC+'/dump_consensus_state';
        try{
            let response = HTTP.get(url);
            let consensus = JSON.parse(response.content);
            consensus = consensus.result;
            let height = consensus.round_state.height;
            let round = consensus.round_state.round;
            let step = consensus.round_state.step;
            let votedPower = Math.round(parseFloat(consensus.round_state.votes[round].prevotes_bit_array.split(" ")[3])*100);

            Chain.update({chainId:Meteor.settings.public.chainId}, {$set:{
                votingHeight: height,
                votingRound: round,
                votingStep: step,
                votedPower: votedPower,
                proposerAddress: consensus.round_state.validators.proposer.address,
                prevotes: consensus.round_state.votes[round].prevotes,
                precommits: consensus.round_state.votes[round].precommits
            }});
        }
        catch(e){
            console.log(url);
            console.log(e);
        }
    },
    'chain.updateStatus': function(){
        this.unblock();
        let url = RPC+'/status';
        try{
            let response = HTTP.get(url);
            let status = JSON.parse(response.content);
            status = status.result;
            let chain = {};
            chain.chainId = status.node_info.network;
            chain.latestBlockHeight = status.sync_info.latest_block_height;
            chain.latestBlockTime = status.sync_info.latest_block_time;

            let latestState = ChainStates.findOne({}, {sort: {height: -1}})
            if (latestState && latestState.height >= chain.latestBlockHeight) {
                return `no updates (getting block ${chain.latestBlockHeight} at block ${latestState.height})`
            }

            // Since Tendermint v0.33, validator page default set to return 30 validators.
            // Query latest height with page 1 and 100 validators per page.
            url = RPC+`/validators?height=${chain.latestBlockHeight}&page=1&per_page=100`;
            response = HTTP.get(url);
            let validators = JSON.parse(response.content);
            validators = validators.result.validators;
            chain.validators = validators.length;
            let activeVP = 0;
            for (v in validators){
                activeVP += parseInt(validators[v].voting_power);
            }
            chain.activeVotingPower = activeVP;


            Chain.update({chainId:chain.chainId}, {$set:chain}, {upsert: true});
            // Get chain states
            if (parseInt(chain.latestBlockHeight) > 0){
                let chainStates = {};
                chainStates.height = parseInt(status.sync_info.latest_block_height);
                chainStates.time = new Date(status.sync_info.latest_block_time);

                url = LCD + '/staking/pool';
                try{
                    response = HTTP.get(url);
                    let bonding = JSON.parse(response.content).result;
                    // chain.bondedTokens = bonding.bonded_tokens;
                    // chain.notBondedTokens = bonding.not_bonded_tokens;
                    chainStates.bondedTokens = parseInt(bonding.bonded_tokens);
                    chainStates.notBondedTokens = parseInt(bonding.not_bonded_tokens);
                }
                catch(e){
                    console.log(url);
                    console.log(e);
                }

                if ( Coin.StakingCoin.denom ) {
                    url = LCD + '/supply/total/'+ Coin.StakingCoin.denom;
                    try{
                        response = HTTP.get(url);
                        let supply = JSON.parse(response.content).result;
                        chainStates.totalSupply = parseInt(supply);
                    }
                    catch(e){
                        console.log(url);
                        console.log(e);
                    }

                    url = LCD + '/distribution/community_pool';
                    try {
                        response = HTTP.get(url);
                        let pool = JSON.parse(response.content).result;
                        if (pool && pool.length > 0){
                            chainStates.communityPool = [];
                            pool.forEach((amount, i) => {
                                if (amount.denom.toLowerCase() === 'swth')
                                chainStates.communityPool.push({
                                    denom: amount.denom,
                                    amount: parseFloat(amount.amount)
                                })
                            })
                        }
                    }
                    catch (e){
                        console.log(url);
                        console.log(e)
                    }

                    /*url = LCD + '/minting/inflation';
                    try{
                        response = HTTP.get(url);
                        let inflation = JSON.parse(response.content).result;
                        if (inflation){
                            chainStates.inflation = parseFloat(inflation)
                        }
                    }
                    catch(e){
                        console.log(url);
                        console.log(e);
                    }*/

                    currentDate = new Date().getTime()
                    startDate = 1597924800000
                    weeksSince = Math.round((currentDate - startDate) / (7 * 24 * 60 * 60 * 1000));

                    console.log('weeksSince Start: ' + weeksSince)

                    switch(parseFloat(weeksSince)) {
                        case 1:
                            chainStates.inflation = 1.923076923 / 100
                            break;
                        case 2:
                            chainStates.inflation = 1.891346154 / 100
                            break;
                        case 3:
                            chainStates.inflation = 1.860138942 / 100
                            break;
                        case 4:
                            chainStates.inflation = 1.82944665 / 100
                            break;
                        case 5:
                            chainStates.inflation = 1.79926078 / 100
                            break;
                        case 6:
                            chainStates.inflation = 1.769572977 / 100
                            break;
                        case 7:
                            chainStates.inflation = 1.740375023 / 100
                            break;
                        case 8:
                            chainStates.inflation = 1.711658835 / 100
                            break;
                        case 9:
                            chainStates.inflation = 1.683416464 / 100
                            break;
                        case 10:
                            chainStates.inflation = 1.655640093 / 100
                            break;
                        case 11:
                            chainStates.inflation = 1.628322031 / 100
                            break;
                        case 12:
                            chainStates.inflation = 1.601454718 / 100
                            break;
                        case 13:
                            chainStates.inflation = 1.575030715 / 100
                            break;
                        case 14:
                            chainStates.inflation = 1.549042708 / 100
                            break;
                        case 15:
                            chainStates.inflation = 1.523483503 / 100
                            break;
                        case 16:
                            chainStates.inflation = 1.498346026 / 100
                            break;
                        case 17:
                            chainStates.inflation = 1.473623316 / 100
                            break;
                        case 18:
                            chainStates.inflation = 1.449308531 / 100
                            break;
                        case 19:
                            chainStates.inflation = 1.425394941 / 100
                            break;
                        case 20:
                            chainStates.inflation = 1.401875924 / 100
                            break;
                        case 21:
                            chainStates.inflation = 1.378744971 / 100
                            break;
                        case 22:
                            chainStates.inflation = 1.355995679 / 100
                            break;
                        case 23:
                            chainStates.inflation = 1.333621751 / 100
                            break;
                        case 24:
                            chainStates.inflation = 1.311616992 / 100
                            break;
                        case 25:
                            chainStates.inflation = 1.289975311 / 100
                            break;
                        case 26:
                            chainStates.inflation = 1.268690719 / 100
                            break;
                        case 27:
                            chainStates.inflation = 1.247757322 / 100
                            break;
                        case 28:
                            chainStates.inflation = 1.227169326 / 100
                            break;
                        case 29:
                            chainStates.inflation = 1.206921032 / 100
                            break;
                        case 30:
                            chainStates.inflation = 1.187006835 / 100
                            break;
                        case 31:
                            chainStates.inflation = 1.167421222 / 100
                            break;
                        case 29:
                            chainStates.inflation = 1.148158772 / 100
                            break;
                        case 30:
                            chainStates.inflation = 1.129214152 / 100
                            break;
                        case 31:
                            chainStates.inflation = 1.110582119 / 100
                            break;
                        case 29:
                            chainStates.inflation = 1.092257514 / 100
                            break;
                        case 30:
                            chainStates.inflation = 1.074235265 / 100
                            break;
                        default:
                            chainStates.inflation = 1.074235265 / 100
                            break;
                    }

                    console.log('chainStates.inflation: ' + chainStates.inflation)

                    url = LCD + '/minting/annual-provisions';
                    try{
                        response = HTTP.get(url);
                        let provisions = JSON.parse(response.content);
                        if (provisions){
                            chainStates.annualProvisions = parseFloat(provisions.result)
                        }
                    }
                    catch(e){
                        console.log(url);
                        console.log(e);
                    }
            		}

                ChainStates.insert(chainStates);
            }

            // chain.totalVotingPower = totalVP;

            // validators = Validators.find({}).fetch();
            // console.log(validators);
            return chain.latestBlockHeight;
        }
        catch (e){
            console.log(url);
            console.log(e);
            return "Error getting chain status.";
        }
    },
    'chain.getLatestStatus': function(){
        Chain.find().sort({created:-1}).limit(1);
    },
    'chain.genesis': function(){
        let chain = Chain.findOne({chainId: Meteor.settings.public.chainId});

        if (chain && chain.readGenesis){
            console.log('Genesis file has been processed');
        }
        else if (Meteor.settings.debug.readGenesis) {
            console.log('=== Start processing genesis file ===');
            let response = HTTP.get(Meteor.settings.genesisFile);
            let genesis = JSON.parse(response.content);
            let distr = genesis.app_state.distr || genesis.app_state.distribution
            let chainParams = {
                chainId: genesis.chain_id,
                genesisTime: genesis.genesis_time,
                consensusParams: genesis.consensus_params,
                auth: genesis.app_state.auth,
                bank: genesis.app_state.bank,
                staking: {
                    pool: genesis.app_state.staking.pool,
                    params: genesis.app_state.staking.params
                },
                mint: genesis.app_state.mint,
                distr: {
                    communityTax: distr.community_tax,
                    baseProposerReward: distr.base_proposer_reward,
                    bonusProposerReward: distr.bonus_proposer_reward,
                    withdrawAddrEnabled: distr.withdraw_addr_enabled
                },
                gov: {
                    startingProposalId: 0,
                    depositParams: {},
                    votingParams: {},
                    tallyParams: {}
                },
                slashing:{
                    params: genesis.app_state.slashing.params
                },
                supply: genesis.app_state.supply,
                crisis: genesis.app_state.crisis
            }

	    if (genesis.app_state.gov) {
                chainParams.gov = {
                    startingProposalId: genesis.app_state.gov.starting_proposal_id,
                    depositParams: genesis.app_state.gov.deposit_params,
                    votingParams: genesis.app_state.gov.voting_params,
                    tallyParams: genesis.app_state.gov.tally_params
                };
	    }
            let totalVotingPower = 0;

            // read gentx
            if (genesis.app_state.genutil && genesis.app_state.genutil.gentxs && (genesis.app_state.genutil.gentxs.length > 0)){
                for (i in genesis.app_state.genutil.gentxs){
                    let msg = genesis.app_state.genutil.gentxs[i].value.msg;
                    // console.log(msg.type);
                    for (m in msg){
                        if (msg[m].type == "cosmos-sdk/MsgCreateValidator"){
                            console.log(msg[m].value);
                            // let command = Meteor.settings.bin.gaiadebug+" pubkey "+msg[m].value.pubkey;
                            let validator = {
                                consensus_pubkey: msg[m].value.pubkey,
                                description: msg[m].value.description,
                                commission: msg[m].value.commission,
                                min_self_delegation: msg[m].value.min_self_delegation,
                                operator_address: msg[m].value.validator_address,
                                delegator_address: msg[m].value.delegator_address,
                                voting_power: Math.floor(parseInt(msg[m].value.value.amount) / Coin.StakingCoin.fraction),
                                jailed: false,
                                status: 2
                            }

                            totalVotingPower += validator.voting_power;

                            let pubkeyType = Meteor.settings.public.secp256k1?'tendermint/PubKeySecp256k1':'tendermint/PubKeyEd25519';
                            let pubkeyValue = Meteor.call('bech32ToPubkey', msg[m].value.pubkey, pubkeyType);
                            // Validators.upsert({consensus_pubkey:msg[m].value.pubkey},validator);

                            validator.pub_key = {
                                "type":pubkeyType,
                                "value":pubkeyValue
                            }

                            validator.address = getAddress(validator.pub_key);
                            validator.accpub = Meteor.call('pubkeyToBech32', validator.pub_key, Meteor.settings.public.bech32PrefixAccPub);
                            validator.operator_pubkey = Meteor.call('pubkeyToBech32', validator.pub_key, Meteor.settings.public.bech32PrefixValPub);
                            VotingPowerHistory.insert({
                                address: validator.address,
                                prev_voting_power: 0,
                                voting_power: validator.voting_power,
                                type: 'add',
                                height: 0,
                                block_time: genesis.genesis_time
                            });

                            Validators.insert(validator);
                        }
                    }
                }
            }

            // read validators from previous chain
            console.log('read validators from previous chain');
            if (genesis.app_state.staking.validators && genesis.app_state.staking.validators.length > 0){
                console.log(genesis.app_state.staking.validators.length);
                let genValidatorsSet = genesis.app_state.staking.validators;
                let genValidators = genesis.validators;
                for (let v in genValidatorsSet){
                    // console.log(genValidators[v]);
                    let validator = genValidatorsSet[v];
                    validator.delegator_address = Meteor.call('getDelegator', genValidatorsSet[v].operator_address);

                    let pubkeyType = Meteor.settings.public.secp256k1?'tendermint/PubKeySecp256k1':'tendermint/PubKeyEd25519';
                    let pubkeyValue = Meteor.call('bech32ToPubkey', validator.consensus_pubkey, pubkeyType);

                    validator.pub_key = {
                        "type":pubkeyType,
                        "value":pubkeyValue
                    }

                    validator.address = getAddress(validator.pub_key);
                    validator.pub_key = validator.pub_key;
                    validator.accpub = Meteor.call('pubkeyToBech32', validator.pub_key, Meteor.settings.public.bech32PrefixAccPub);
                    validator.operator_pubkey = Meteor.call('pubkeyToBech32', validator.pub_key, Meteor.settings.public.bech32PrefixValPub);

                    validator.voting_power = findVotingPower(validator, genValidators);
                    totalVotingPower += validator.voting_power;

                    Validators.upsert({consensus_pubkey:validator.consensus_pubkey},validator);
                    VotingPowerHistory.insert({
                        address: validator.address,
                        prev_voting_power: 0,
                        voting_power: validator.voting_power,
                        type: 'add',
                        height: 0,
                        block_time: genesis.genesis_time
                    });
                }
            }

            chainParams.readGenesis = true;
            chainParams.activeVotingPower = totalVotingPower;
            let result = Chain.upsert({chainId:chainParams.chainId}, {$set:chainParams});


            console.log('=== Finished processing genesis file ===');

        }

        return true;
    }
})
