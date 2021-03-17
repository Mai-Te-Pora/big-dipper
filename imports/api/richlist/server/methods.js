import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

Meteor.methods({
    'richlist.getRichList': function(denom, limit){
        this.unblock();
        let url = `${Meteor.settings.mtp.richListEndpointBaseUrl}/richlist/${denom}/top?limit=${limit}`;
        try{
            let richListRes = HTTP.get(url);
            if (richListRes.statusCode == 200){
                let richList = JSON.parse(richListRes.content);
                return richList;
            }
        }
        catch (e){
            console.error(`An error has occured: ${e} (${url})`);
        }
    }
});