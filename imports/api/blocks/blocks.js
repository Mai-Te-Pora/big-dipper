import { Mongo } from 'meteor/mongo';
import { Validators } from '../validators/validators.js';

export const Blockscon = new Mongo.Collection('blocks');

Blockscon.helpers({
    proposer(){
        return Validators.findOne({address:this.proposerAddress});
    }
});
