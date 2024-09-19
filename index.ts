import { ethers } from 'ethers';
import 'dotenv/config';
import { generateRandomEthereumAddresses, logToFile, wait, writeToFile } from './utils';

// const provider = new ethers.InfuraProvider("sepolia", process.env.INFURA_PROJECT_ID); // or use Alchemy
const provider = new ethers.JsonRpcProvider("https://sepolia-rpc.scroll.io/");

const privateKey = process.env.PRIVATE_KEY!;
console.log(privateKey);
const wallet = new ethers.Wallet(privateKey, provider);
const addressTo = '0x2962966538176AFAd066367eE5A9709Bee83D81b';

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)"
];

const contractABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "lockAddress", "type": "address" },
            { "internalType": "uint256[]", "name": "timestamps", "type": "uint256[]" },
            { "internalType": "uint256[]", "name": "balances", "type": "uint256[]" }
        ],
        "name": "lock",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const contractAddress = process.env.CONTRACT_ADDRESS!;
const tokenAddress = process.env.TOKEN_ADDRESS!;

const contract = new ethers.Contract(contractAddress, contractABI, wallet);
const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

async function multipleLock(addresses: string[], timestamps: number[], balances: number[], maxRetries: number = 3) {

    const amountOfAddress = balances.reduce((a, b) => a + b);
    const amount = amountOfAddress * addresses.length;
    console.log(amount);
    const approveTx = await tokenContract.approve(contractAddress, amount);
    let receipt = await approveTx.wait();
    console.log(`Approve transaction: ${approveTx.hash}`);
    let lastTransactionHash = "";

    for (let i = 0; i < addresses.length;) {
        const address = addresses[i];

        if (lastTransactionHash.length > 0 && await !getLastTransactionStatus(lastTransactionHash)) {
            await wait(1000);
            continue;
        } else {
            i++;
        }

        let attempts = 0;
        let success = false;

        while (attempts < maxRetries && !success) {
            try {
                console.log(`=========== Processing ${addresses.indexOf(address)} ===========`)
                console.log('current address', address)
                const tx = await contract.lock(address, timestamps, balances);
                console.log(`Transaction sent for ${address}:`, tx.hash);

                logToFile(`Timestamps of ${address}: ${JSON.stringify(timestamps)}`)
                logToFile(`Balances of ${address}: ${JSON.stringify(balances)}`)

                receipt = await tx.wait();
                lastTransactionHash = tx.hash;
                console.log(`Transaction confirmed for ${address} in block:`, receipt.blockNumber);
                success = true;
            } catch (error) {
                attempts++;
                console.error(`Error staking tokens for ${address}. Attempt ${attempts}:`, error);

                if (attempts >= maxRetries) {
                    console.error(`Failed to stake tokens for ${address} after ${maxRetries} attempts.`);
                }
            }
        }
    }

}

async function getLastTransactionStatus(transactionHash: string): Promise<boolean> {
    try {
        const receipt = await provider.getTransactionReceipt(transactionHash);

        if (receipt) {
            if (receipt.status === 1) {
                console.log(`Transaction ${transactionHash} was successful.`);
                return true;
            } else {
                console.log(`Transaction ${transactionHash} failed.`);
                return false;
            }
        } else {
            console.log(`Transaction ${transactionHash} is still pending or not found.'`);
            return false;
        }
    } catch (error: any) {
        console.log(`Error fetching transaction ${transactionHash}  status: ${error.message}`);
        return false;
    }
}


const addressCount = 500;
const randomAddresses = generateRandomEthereumAddresses(addressCount);
const timestamps = [1726642888, 1726652900];
const balances = [1000, 2000];
console.log(randomAddresses)

writeToFile(randomAddresses, './randomAddresses.json')

multipleLock(randomAddresses, timestamps, balances); 
