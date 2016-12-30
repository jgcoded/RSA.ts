import * as utils from "./utils";

/*!
    \brief Calculates the greatest common divisor of a and b
    \return gcd(a, b)
*/
export function gcd(a : number, b : number) : number {
    let x : number = a;
    let y : number = b;

    while(y != 0) {

        let r : number = x % y; 
        x = y;
        y = r;
    }

    return x;
}

/*!
    \brief Tests if a and b are relative prime
    \return True if gcd(a, b) == 1
*/
export function areRelativelyPrime(a : number, b : number) : boolean {
    return gcd(a, b) == 1;
}

/*!
    \brief Tests if all numbers in the input array are pairwise relatively prime
    \return true if for all pairs in as, gcd(a, b) == 1
*/
export function arePairwiseRelativelyPrime(as : Array<number>) : boolean {

    return as.every((left : number, leftIndex : number) => {
        return as.every((right : number, rightIndex : number) => {
            // don't compare the same number
            if(leftIndex == rightIndex) { 
                return true;
            }

            return areRelativelyPrime(left, right);
        })
    });
}

/*!
    \brief Calculates the modular inverse of a mod n

    \return A number s such that s*a mod n == 1
*/
export function modularInverse(a : number, n : number) : number {
        // from https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm

        let t : number = 0;
        let newT : number = 1;

        let r : number = n;
        let newR : number = a;

        while(newR != 0) {

            let quotient : number = Math.floor(r / newR);

            [t, newT] = [newT, t - quotient*newT];
            [r, newR] = [newR, r - quotient*newR];
        }

        if(r > 1) {
            throw Error(`${a} mod ${n} does not have an inverse.`);
        }

        if(t < 0) {
            t += n;
        }

        return t;
}

/*!
    \brief Solves the system of linear congruences using the Chinese Remainder Theorem

    \param ms pairwise relatively prime positive integers greater than 1
    \param as arbitray integers
    \return the number that provides a solution to the
            system of linear congruences

    \throws An exception if a modular inverse cannot be found. This should not
            happen if ms are actually pairwise relative prime positive integers
            greater than 1.
*/
export function chineseRemainderTheorem(as : Array<number>, ms : Array<number>) : number {

    let m : number = ms.reduce((previousValue : number, currentValue : number) => { 
            return previousValue * currentValue 
        }, 1);

    let Ms : Array<number> = ms.map((value : number) => { return m / value });

    let system : Array<[number, number]> = utils.zip(Ms, ms);

    let ys : Array<number> = system.map((value : [number, number]) => {
        let a : number = value[0];
        let n : number = value[1];
        return modularInverse(a, n);
    });

    return utils.zip3(as, Ms, ys).reduce((previousValue, currentValue) => {
        return previousValue + currentValue[0] * currentValue[1] * currentValue[2];
    }, 0);
}

/*!
    \brief calculates b^n mod m, where n can be large

    \param b the base of the exponentiation b^n
    \param n the exponent in b^n
    \param m the modulus

    \return The result of b^n mod m
*/
export function fastModularExponentiation(b : number, n : number, m : number) : number {
    
    let x : number = 1;
    let power : number = b % m;
    for(let i : number = 0; i < 32; ++i) {
        let bit = (n >> i) & 1;

        if(bit == 1) {
            x = (x*power) % m;
        } 

        power = (power*power) % m;
    }

    return x;
}
