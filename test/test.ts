
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

        let b : number = 3;
        let n : number = 644;
        let m : number = 645;

    }
}

@suite class RSA {

    @test "Translation"() {

        expect(rsa.translateMessage('abcz')).equal('00010225');
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
        
        let p : number = 43;
        let q : number = 59;
        let n : number = p*q;

        let e : number = 13;

        expect(maths.isRelativelyPrime(e, (p-1)*(q-1))).ok();

        let message : string = "abab";

        let translatedMessage = rsa.translateMessage(message);
        let blocksToEncrypt = rsa.getBlocksToEncrypt(translatedMessage, n);

        expect(blocksToEncrypt).eql([1, 1]);

        let cipherTextBlocks : Array<number> = blocksToEncrypt.map((value : number) => {

            return Math.pow(value, e) % n;
        });

        expect(cipherTextBlocks).eql([1, 1]);
    }
}