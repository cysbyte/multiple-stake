import { ethers } from 'ethers';
import 'dotenv/config';

async function main() {
    
    const provider = new ethers.JsonRpcProvider("https://sepolia-rpc.scroll.io/");

    const contractAddress = process.env.CONTRACT_ADDRESS!;
    const contractABI = [
        "function addressIndex(address _address) returns (uint256)"
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    const addressToCheck = "0xd4E256379dCF42bF11a38a4Bb18e7B02509ec34e";

    const balance = await contract.addressIndex(addressToCheck);
    console.log(`Balance of ${addressToCheck}: ${balance.toString()}`);
}

main().catch(console.error);
