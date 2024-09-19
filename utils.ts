import { Wallet } from 'ethers';
import * as fs from 'fs';
import { appendFileSync } from 'fs';

export function generateRandomEthereumAddresses(count: number): string[] {
    const addresses: string[] = [];

    for (let i = 0; i < count; i++) {
        const wallet = Wallet.createRandom();
        const address = wallet.address.toString();
        if (!addresses.includes(address)) {
            addresses.push(address);
        }
    }

    return addresses;
}

export function writeToFile(array: Array<string>, filePath: string) {
    // Convert the array to a string format (e.g., JSON)
const data = JSON.stringify(array, null, 2); // Pretty-print with 2 spaces

// Specify the file path where you want to write the data

// Write the data to the file
fs.writeFile(filePath, data, (err) => {
    if (err) {
        console.error('Error writing to file:', err);
    } else {
        console.log('Array written to file successfully.');
    }
});
}

export function readArrayFromJson(filePath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                return reject(`Error reading the file: ${err}`);
            }

            try {
                const array: string[] = JSON.parse(data);
                resolve(array);
            } catch (parseError) {
                reject(`Error parsing JSON: ${parseError}`);
            }
        });
    });
}


export function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function logToFile(message: string, filename: string = './log.txt'): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    appendFileSync(filename, logMessage, { encoding: 'utf8' });
}