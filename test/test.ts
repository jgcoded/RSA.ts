
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import * as maths from "./../maths";
import * as utils from "./../utils";
import * as rsa from "./../rsa";
import expect = require("expect.js");

@suite class Utils {

    @test "Zip"() {

        let as : Array<number> = [1, 2, 3, 4, 5];
        let bs : Array<string> = ["hi", "lol", "bye"];
        let zipped : Array<[number, string]> = [[1, "hi"], [2, "lol"], [3, "bye"]];

        expect(utils.zip(as, bs)).eql(zipped);
        expect(as).eql([1,2,3,4,5]);
        expect(bs).eql(["hi", "lol", "bye"]);
    }

    @test "Zip3"() {

        let as : Array<number> = [1, 2, 3, 4, 5];
        let bs : Array<string> = ["hi", "lol", "bye"];
        let cs : Array<boolean> = [true, false, false, true];
        let zipped3 : Array<[number, string, boolean]> = [[1, "hi", true], [2, "lol", false], [3, "bye", false]];
        expect(utils.zip3(as, bs, cs)).eql(zipped3);
        expect(as).eql([1,2,3,4,5]);
        expect(bs).eql(["hi", "lol", "bye"]);
        expect(cs).eql([true, false , false, true]);
    }

}


@suite class Maths {

    @test "Euclidian Algorithm (gcd)"() {

        expect(maths.gcd(101, 4620)).eql(1);
        expect(maths.gcd(414, 662)).eql(2);
        expect(maths.gcd(5, 15)).eql(5);
        expect(maths.gcd(252, 198)).eql(18);
    }

    @test "Relatively Prime"() {

        expect(maths.isRelativelyPrime(101, 4620)).ok();
    }

    @test "Pairwise Relatively Prime"() {

        expect(maths.arePairwiseRelativelyPrime([3, 5, 7])).ok();
        expect(maths.arePairwiseRelativelyPrime([2, 3, 6])).not.ok();
    }

    @test "Extended Euclidian Algorithm (Modular Inverse)"() {

        expect(maths.modularInverse(101, 4620)).equal(1601);
    }

    @test "Chinese Remainder Theorem"() {

        let as : Array<number> = [2, 3, 2];
        let ms : Array<number> = [3, 5, 7];

        expect(maths.arePairwiseRelativelyPrime(ms)).ok();

        let solution = maths.chineseRemainderTheorem(as, ms);

        expect(solution).equal(233);
        // can further reduce to:
        expect(solution % (3*5*7)).equal(23);
    }

    @test "Fast Modular Exponentiation"() {
        expect(maths.fastModularExponentiation(3, 644, 645)).equal(36);
    }
}

@suite class RSA {

    @test "Translation"() {

        expect(rsa.translateMessage('abcz')).equal('00010225');
    }

    @test "Untranslate"() {

        expect(rsa.untranslateMessage('00010225')).equal('abcz');
    }

    @test "Block Size"() {

        expect(rsa.getBlockSize(23)).equal(0);
        expect(rsa.getBlockSize(29)).equal(2);
        expect(rsa.getBlockSize(2537)).equal(4);
        expect(rsa.getBlockSize(104723)).equal(4);
        expect(rsa.getBlockSize(694847533)).equal(8);
    }

    @test "Blocks"() {

        expect(rsa.getBlocksToEncrypt('00010225', 2537)).eql([1, 225]);
        expect(rsa.getBlocksToEncrypt('0001022519', 2537)).eql([1, 225, 1923]);
    }

    @test "Encryption"() {

        // Keep p and q secret
        let p : number = 43;
        let q : number = 59;

        let e : number = 13; // Relatively prime to (p-1)(q-1)
        expect(maths.isRelativelyPrime(e, (p-1)*(q-1))).ok();

        let n : number = p*q;

        let message : string = 'stop';
        let blocksToEncrypt = rsa.getBlocksToEncrypt(rsa.translateMessage(message), n);
        expect(rsa.encrypt(blocksToEncrypt, n, 13)).eql([2081, 2182]);
    }

    @test "Decryption"() {

        // Keep p and q secret
        let p : number = 43;
        let q : number = 59;

        let n : number = p*q;
        let e : number = 13;

        // d can be precomputed
        let d : number = maths.modularInverse(e, (p-1)*(q-1));
        
        expect(rsa.decrypt([2081, 2182], n, d)).eql([1819, 1415]);
        expect(rsa.blocksToPlaintext(rsa.decrypt([2081, 2182], n, d))).equal('stop');
    }

    /*
        Scenario: Alice wants to send a message to her friend Bob
                  Bob so that Bob can be sure it came from her.
    */
    @test "Digital Signature"() {

        interface Key {
            n : number,
            v : number
        }

        // Bob has the public key
        let publicKey : Key = { n:2537, v:13 };

        // Alice has the private key
        let privateKey : Key = { n:2537, v:937 };

        // Alice applies the decrypt() algorithm first
        let message = 'stop';
        let translatedMessage : string = rsa.translateMessage(message);
        let blocks : Array<number> = rsa.getBlocksToEncrypt(translatedMessage, publicKey.n);
        let encryptedBlocks = rsa.decrypt(blocks, publicKey.n, privateKey.v);

        // Alice sends the encryptedBlocks to Bob

        // Bob Receives the encryptedBlocks, and he applies the RSA encryption
        let decryptedBlocks : Array<number> = rsa.encrypt(encryptedBlocks, publicKey.n, publicKey.v);
        let plaintext : string = rsa.blocksToPlaintext(blocks);

        expect(plaintext).equal(message);
    }
}
