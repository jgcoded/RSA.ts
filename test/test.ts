
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

        expect(maths.areRelativelyPrime(101, 4620)).ok();
    }

    @test "Pairwise Relatively Prime"() {

        expect(maths.arePairwiseRelativelyPrime([3, 5, 7])).ok();
        expect(maths.arePairwiseRelativelyPrime([2, 3, 6])).not.ok();
    }

    @test "Extended Euclidian Algorithm (Modular Inverse)"() {

        expect(maths.modularInverse(101, 4620)).equal(1601);
        expect(maths.modularInverse(3, 136*130)).equal(11787);
        expect(11787 % 136).equal(91);
        expect(11787 % 130).equal(87);
        expect(maths.modularInverse(131, 137)).equal(114);
    }

    @test "Chinese Remainder Theorem"() {

        let as : Array<number> = [2, 3, 2];
        let ms : Array<number> = [3, 5, 7];

        expect(maths.arePairwiseRelativelyPrime(ms)).ok();

        let solution = maths.chineseRemainderTheorem(as, ms);

        expect(solution).equal(23);
    }

    @test "Fast Modular Exponentiation"() {
        expect(maths.fastModularExponentiation(3, 644, 645)).equal(36);
        expect(maths.fastModularExponentiation(8363, 11787, 17947)).equal(513);
        expect(maths.fastModularExponentiation(8363, 91, 137)).equal(102);
        expect(maths.fastModularExponentiation(8363, 87, 131)).equal(120);
        expect(114*(102-120+137) % 137).equal(3);
    }
}

@suite class RSA {

    @test "Translation"() {

        expect(rsa.translateMessage('abcz')).equal('00010225');
        expect(rsa.translateMessage('hello')).equal('0704111114');
        expect(rsa.translateMessage('abcdefghijklmnopqrstuvwxyz')).eql(
            '0001020304050607080910111213141516171819202122232425'
        );
    }

    @test "Untranslate"() {

        expect(rsa.untranslateMessage('00010225')).equal('abcz');
        expect(rsa.untranslateMessage('0704111114')).equal('hello');
        expect(rsa.untranslateMessage('0001020304050607080910111213141516171819202122232425'))
        .eql('abcdefghijklmnopqrstuvwxyz');

        expect(rsa.untranslateMessage('0')).equal('a');
    }

    @test "Block Size"() {

        expect(rsa.calculateBlockSize(23)).equal(0);
        expect(rsa.calculateBlockSize(29)).equal(2);
        expect(rsa.calculateBlockSize(2537)).equal(4);
        expect(rsa.calculateBlockSize(104723)).equal(4);
        expect(rsa.calculateBlockSize(694847533)).equal(8);
    }

    @test "Plaintext to Blocks"() {

        expect(rsa.plaintextToBlocks('abcz', 2537)).eql([1, 225]);
        expect(rsa.plaintextToBlocks('abczs', 2537)).eql([1, 225, 1823]);
        expect(rsa.plaintextToBlocks('abcdefghij', 2537)).eql([1, 203, 405, 607, 809]);
    }

    @test "Blocks to plaintext"() {
       expect(rsa.blocksToPlaintext([1, 203, 405, 607, 809], 2537)).equal('abcdefghij');
    }

    @test "Encryption"() {

        // Keep p and q secret
        let p : number = 43;
        let q : number = 59;

        let e : number = 13;
        expect(maths.areRelativelyPrime(e, (p-1)*(q-1))).ok();

        let key : rsa.PublicKey = rsa.makePublicKey(p, q, e);

        expect(rsa.encrypt([704, 1115], key)).eql([981, 461]);
        expect(rsa.encrypt([1819, 1415], key)).eql([2081, 2182]);
    }

    @test "Decryption"() {

        // Keep p and q secret
        let p : number = 43;
        let q : number = 59;

        let e : number = 13;
        expect(maths.areRelativelyPrime(e, (p-1)*(q-1))).ok();

        let key : rsa.PrivateKey = rsa.makePrivateKey(p, q, e);

        expect(rsa.decrypt([981, 461], key)).eql([704, 1115]);
        expect(rsa.decrypt([2081, 2182], key)).eql([1819, 1415]);
    }

    /*
        Scenario: Alice wants to send a message to her friends
                  so that they can be sure it came from her.
    */
    @test "Digital Signature"() {

        // Only Alice knows p and q, and she used those to calculate e
        let p : number = 43;
        let q : number = 59;
        let e : number = 13;
        expect(maths.areRelativelyPrime(e, (p-1)*(q-1))).ok();

        // Alice gives the public key to her friends
        let publicKey : rsa.PublicKey = rsa.makePublicKey(p, q, e);

        // Only Alice has the private key
        let privateKey : rsa.PrivateKey = rsa.makePrivateKey(p, q, e);

        // Alice signs the message first
        let message = 'stop';
        let blocks : Array<number> = rsa.plaintextToBlocks(message, publicKey.n);
        let encryptedBlocks = rsa.decrypt(blocks, privateKey);

        // Alice sends the encryptedBlocks to her friends

        // Her friends receive the encryptedBlocks, and he applies the RSA encryption algorithm
        let decryptedBlocks : Array<number> = rsa.encrypt(encryptedBlocks, publicKey);
        let plaintext : string = rsa.blocksToPlaintext(blocks, publicKey.n);

        expect(plaintext).equal(message);
    }

    /*
        Scenario: Alice wants to send a message that only Bob
                  can read it, and so that Bob can be sure it
                  came from her.
    */
    @test "Signed Secret Message"() {

        // Alice gives Bob her public key
        let alicesPublicKey : rsa.PublicKey = rsa.makePublicKey(43, 59, 13);

        // Only Alice knows her private key
        let alicesPrivateKey : rsa.PrivateKey = rsa.makePrivateKey(43, 59, 13);

        // Bob gives Alice his public key
        let bobsPublicKey : rsa.PublicKey = rsa.makePublicKey(137, 131, 3);

        // Only bob knows his private key
        let bobsPrivateKey : rsa.PrivateKey = rsa.makePrivateKey(137, 131, 3);

        let message : string = 'sosx';

        let blocks : Array<number> = [];

        // First, Alice signs her message
        blocks = rsa.decrypt(rsa.plaintextToBlocks(message, alicesPublicKey.n), alicesPrivateKey);

        // Then, Alice encrypts her message using Bob's public key
        blocks = rsa.encrypt(blocks, bobsPublicKey);

        // Alice sends the encrypted blocks to Bob

        // Bob receives the encrypted blocks and decrypts them
        blocks = rsa.decrypt(blocks, bobsPrivateKey);

        // Then, Bob applies the RSA encryption using Alice's public key
        blocks = rsa.encrypt(blocks, alicesPublicKey);

        // Finally, Bob can see Alice's signed, secret message
        expect(rsa.blocksToPlaintext(blocks, alicesPublicKey.n)).equal(message);
    }
}
