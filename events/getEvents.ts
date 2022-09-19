import { kvPair } from '../types';
import { Event } from '../backend/Event';
const dotenv = require("dotenv");
dotenv.config();


export async function getEventsByContract(contractAddress: string) {
    var url = 'https://api.etherscan.io/api?module=contract&action=getabi&address=' + contractAddress+ '&apikey=' + process.env.REACT_APP_ETHERSCANAPIKEY;

    return fetch(url) 
        .then(response => response.json())
        .then(data => {
            var contractABI = data.result;
            var parsedABI = JSON.parse(contractABI)
            var items = Object.keys(parsedABI).length;
            var indexedEvents: Event[] = []

            // loop thru all items in json object
            for (var i = 0; i < items; i++) {
                // if the item is an event, investigate
                if (parsedABI[i].type === "event") {
                    var numOfInputs = parsedABI[i].inputs.length; // get number of params in event
                    var hasIndexed: boolean = false;

                    // loop through params of event
                    for (var j = 0; j < numOfInputs; j++) {
                        // check if the event has any indexed params
                        if (parsedABI[i].inputs[j].indexed === true) {
                            hasIndexed = true; // mark it as worthy if it does
                            break;
                        }
                    }

                    // if this event had an indexed param we add it to indexedEvents
                    if (hasIndexed === true) {
                        var eventName = parsedABI[i].name;
                        var inputsArray: kvPair[] = []
                        for (var k = 0; k < numOfInputs; k++) {
                            inputsArray.push(parsedABI[i].inputs[k].name, parsedABI[i].inputs[k].type)
                        } 
                        var event = new Event(eventName, inputsArray);
                        indexedEvents.push(event);
                    }
                }
            }
            return indexedEvents;
        });       
}      