
export function translateMessage(message : string) : string {
    
    let characters : Array<string> = message.split('');

    let translation : string = characters.reduce((previousValue : string, currentValue : string) => {
        
        let c =  currentValue.charCodeAt(0) - 'a'.charCodeAt(0);
        
        if(c < 10) {
            return previousValue + '0' + c;
        }

        return previousValue + c;
    }, '');

    return translation;
}

export function getBlockSize(n : number) : number {
    let blockSize : number = 0;
    let digits : number = 0;

    while(digits = 25*Math.pow(10, blockSize) + digits, digits < n) {
        blockSize += 2
    }

    return blockSize;
}

export function getBlocksToEncrypt(translatedMessage : string, n : number) : Array<number> {
    
    let blockSize : number = getBlockSize(n);
    let blocks : Array<number> = [];

    while(translatedMessage.length) {
        let blockString : string = translatedMessage.substr(0, blockSize);
        translatedMessage = translatedMessage.slice(blockSize);
        // pad with Xs
        for(let i : number = 0; i < blockString.length % blockSize; i += 2) {
            blockString += 'x'.charCodeAt(0) - 'a'.charCodeAt(0);
        }

        blocks.push(Number(blockString));
    }

    return blocks;
}

