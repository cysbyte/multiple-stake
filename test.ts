import { ethers } from 'ethers';
import 'dotenv/config';
import { readArrayFromJson } from './utils';

const provider = new ethers.JsonRpcProvider("https://sepolia-rpc.scroll.io/");

const contractAddress = process.env.CONTRACT_ADDRESS!;
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "lockAddress",
                "type": "address"
            }
        ],
        "name": "getIndex",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "lockAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "getLockInfo",
        "outputs": [
            {
                "internalType": "LockInfo",
                "name": "",
                "type": "tuple",
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "lockBalance",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "lockTimeStamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "lockTimeStamp",
                        "type": "uint256"
                    }
                ]
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

const contract = new ethers.Contract(contractAddress, contractABI, provider);

export const timestamps = [1726642888, 1726652900];
export const balances = [1000, 2000];

async function check(addressToCheck: string) {

    const index = await contract.getIndex(addressToCheck);

    if (index !== BigInt(2)) {
        console.log(`Index of ${addressToCheck} not equel 1`)
    }

    let lockInfo = await contract.getLockInfo(addressToCheck, 0);
    // console.log(`First lock info: ${lockInfo}`)
    if (lockInfo[0] !== BigInt(balances[0])
        || lockInfo[1] !== BigInt(timestamps[0])
        || lockInfo[2] !== BigInt(0)
    ) {
        console.log(`First lock info of ${addressToCheck} is wrong`)
    }

    lockInfo = await contract.getLockInfo(addressToCheck, 1);
    // console.log(`Second lock info: ${lockInfo}`)
    if (lockInfo[0] !== BigInt(balances[1])
        || lockInfo[1] !== BigInt(timestamps[1])
        || lockInfo[2] !== BigInt(0)
    ) {
        console.log(`Second lock info of ${addressToCheck} is wrong`)
    }
    //console.log(`${addressToCheck} is ok`)

}


readArrayFromJson('./randomAddresses.json')
    .then(array => {
        console.log('Array read from file:', array);
        for(const address of array) {
            console.log(`Compared ${array.indexOf(address)}`)
            check(address)
        }
    })
    .catch(error => {
        console.error(error);
    });

