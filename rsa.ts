
import * as maths from "./maths"; 

/*!
    \brief Translates a message with ASCII characters a-z to padded numbers

    The letter a is mapped to 00, b is mapped to 01,..., z is mapped to 25
    Example: hello becomes 07 04 11 11 14 (but with no spaces)

    \param message A string of lowercase letters from a to z

    \return a translated string that has an even numbered length
*/
export function translateMessage(message : string) : string {
    
    let characters : Array<string> = message.split('');

    let translation : string = characters.reduce((previousValue : string, currentValue : string) => {
        
        let c : number =  currentValue.charCodeAt(0) - 'a'.charCodeAt(0);
        
        if(c < 10) {
            return previousValue + '0' + c;
        }

        return previousValue + c;
    }, '');

    return translation;
}

/*!
    \brief Translates a string of numbers to ASCII characters

    This does the opposite of translateMessage(). The output of
    translateMessage will always be an even number, but this
    function does not expect translatedMessage to have an
    even numbered length. In the case that it doesn't, the digits
    in translatedMessage will be padded automatically.

    Example: 0704111114 becomes hello

    \param translatedMessage A string of numbers
*/
export function untranslateMessage(translatedMessage : string) : string {

    let message : string = "";

    while(translatedMessage.length) {
        let char : string = translatedMessage.substr(0, 2);
        translatedMessage = translatedMessage.slice(2);

        if(char.length != 2) {
            char = '0' + char;
        }

        message += String.fromCharCode(Number(char) + 'a'.charCodeAt(0));
    }

    return message;
}

/*!
    \brief Calculates the number of digits in a block

    \param n A positive integer

    \return The number of digits in a block
*/
export function calculateBlockSize(n : number) : number {
    let blockSize : number = 0;
    let digits : number = 0;

    while(digits = 25*Math.pow(10, blockSize) + digits, digits < n) {
        blockSize += 2
    }

    return blockSize;
}

/*!
    \brief Converts a plaintext message to an array of numbers called blocks

    The blocks this function returns can then be passed to encrypt() or decrypt().

    \param plaintext The plaintext message to convert into blocks
    \param n The public key n value

    \return An array of numbers, called blocks
*/
export function plaintextToBlocks(plaintext : string, n : number) : Array<number> {
    
    let translatedMessage : string = translateMessage(plaintext);

    let blockSize : number = calculateBlockSize(n);
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

/*!
    Converts an array of numbers to a plaintext message

    This function is supposed to be used with decrypt(). That is,
    decrypt()'s output is this function's input.

    \param blocks The array of numbers

    \return The plaintext message represented by the blocks
*/
export function blocksToPlaintext(blocks : Array<number>) : string {
    return blocks.map((value : number) => {
        return untranslateMessage(value.toString());
    }).reduce((previousValue : string, value : string) => {
        return previousValue + value;
    });
}


/*!
    \brief Encrypts a plaintext message using the RSA block cipher algorithm

    This function is not secure, and it is prone to overflow. This is because
    this function does not have an integer representation for integers larger
    than what JavaScript allows. As a result, small n and e values must
    be used.

    \param message A plaintext message to encrypt
    \param n n=p*q, where p and q are prime numbers, and (p-1)(q-1)
             are relatively prime to e
    \param e A positive integer that is relatively prime to (p-1)(q-1)

    \return An array of numbers representing the encrypted message
*/
export function encrypt(blocksToEncrypt : Array<number>, n : number, e : number) : Array<number> {

    return blocksToEncrypt.map((value : number) => {
        return maths.fastModularExponentiation(value, e, n);
    });
}

/*!
    \brief Decrypts an array of blocks encrypted with the RSA block cipher algorithm

    This function is not secure, and it is prone to overflow. This is because
    this function does not have an integer representation for integers larger
    than what JavaScript allows. As a result, small n and e values must
    be used.

    TODO: use the Chinese Remainder Theorem from maths.ts to optimize decryption

    \param cipherBlocks An array of numbers obatained from the encrypt() function
    \param n n=p*q, where p and q are prime numbers and (p-1)(q-1) are
             relatively prime to e, the positive integer used in the
             RSA encryption algorithm.
    \param d The module inverse of e mod (p-1)(q-1), also known as the decryption key

    \return An array of numbers representing the plaintext message
*/
export function decrypt(cipherBlocks : Array<number>, n : number, d : number) : Array<number> {
    
    let blockSize = calculateBlockSize(n);

    return cipherBlocks.map((value : number) => {
        return maths.fastModularExponentiation(value, d, n);
    });
}
