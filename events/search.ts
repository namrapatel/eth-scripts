import { Event } from '../backend/Event'
import { Web3Provider } from '@ethersproject/providers'
import { ethers, Contract, ContractInterface } from 'ethers'

export function Search(contractAddress: string, eventName: string, provider: Web3Provider) {

    var url = 'https://api.etherscan.io/api?module=contract&action=getabi&address=0x9724fDF5aE41570dEcC2D3094C65eafA7E1aB7D4&apikey=' + process.env.REACT_APP_ETHERSCANAPIKEY;

    fetch(url) 
        .then(response => response.json())
        .then(data => {
            console.log(1)
            var contractABI = data.result;
            var parsedABI = JSON.parse(contractABI);

            var contract: Contract = new Contract(contractAddress, parsedABI, provider)

            console.log(contract.filters.AskCanceled(null))

            // TODO: add input for contract address
            // TODO: spawn inputs for each of the events for that contract
            // TODO: figure out what a null field means, basically how to query filters
            // TODO: surface addresses
    });
}