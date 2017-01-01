
import * as maths from "./maths"; 

/*!
    \brief Data structure that holds RSA information that can be given
           out to others
*/
export interface PublicKey {
    n : number,
    e : number
}

/*!
    \brief Data structure that holds RSA information that must NOT
           be given out to others
*/
export interface PrivateKey {
    p : number,
    q : number,
    d : number,
    dp : number,
    dq : number,
    qinv : number
}

/*!
    \brief Creates a private key from p, q, and e

    \param p A prime number
    \param q A prime number
    \param e A positive integer that is relatively prime to (p-1)*(q-1)

    \return a PrivateKey object
*/
export function makePrivateKey(p : number, q : number, e : number) : PrivateKey {
    
    let d : number = maths.modularInverse(e, (p-1)*(q-1));
    
    return {
        p: p,
        q: q,
        d: d,
        dp: d % (p-1),
        dq: d % (q-1),
        qinv: maths.modularInverse(q, p)
    };
}

export function makePublicKey(p : number, q : number, e : number) : PublicKey {
    return {
        n: p*q,
        e: e
    };
}

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
    \param n The public key n value

    \return The plaintext message represented by the blocks
*/
export function blocksToPlaintext(blocks : Array<number>, n : number) : string {
    
    let blockSize : number = calculateBlockSize(n);

    return blocks.map((value : number) => {

        let blockString = value.toString();

        // Add in missing zeros
        let paddingAmount : number = blockSize - blockString.length;
        let padding = '';
        if(paddingAmount < 0) {
            paddingAmount = 0;
        }

        for(let i : number = 0; i < paddingAmount; i++) {
            padding += '0';
        }

        blockString = padding + blockString;

        return untranslateMessage(blockString);
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
export function encrypt(blocksToEncrypt : Array<number>, key : PublicKey) : Array<number> {

    return blocksToEncrypt.map((value : number) => {
        return maths.fastModularExponentiation(value, key.e, key.n);
    });
}

/*!
    \brief Decrypts an array of blocks encrypted with the RSA block cipher algorithm

    This function is not secure, and it is prone to overflow. This is because
    this function does not have an integer representation for integers larger
    than what JavaScript allows. As a result, small n and e values must
    be used.

    \param cipherBlocks An array of numbers obatained from the encrypt() function
    \param key The private key used to decrypt the message

    \return An array of numbers representing the plaintext message
*/
export function decrypt(blocks : Array<number>, key : PrivateKey) : Array<number> {
    
    /*
        Implementation using the general Chinese Remainder algorithm:
        return blocks.map((value : number) => {

            let cp : number = maths.fastModularExponentiation(value, 1, key.p);
            let cq : number = maths.fastModularExponentiation(value, 1, key.q);

            let mp : number = maths.fastModularExponentiation(cp, key.dp, key.p);
            let mq : number = maths.fastModularExponentiation(cq, key.dq, key.q);

            return maths.chineseRemainderTheorem([mp, mq], [key.p, key.q]);
        });
    */

    // Chinese Remainder algorithm optimization from:
    // https://en.wikipedia.org/wiki/RSA_(cryptosystem)#Using_the_Chinese_remainder_algorithm
    return blocks.map((value : number) => {

        let m1 : number = maths.fastModularExponentiation(value, key.dp, key.p);
        let m2 : number = maths.fastModularExponentiation(value, key.dq, key.q);

        let h : number = 0;

        if(m1 < m2) {
            
            h = (key.qinv*(m1 - m2 + key.p)) % key.p;

        } else {

            h = (key.qinv*(m1 - m2)) % key.p;
        }

        return m2 + h*key.q;
    });  
}
