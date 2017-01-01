# RSA.ts

An implementation of the RSA encryption and decryption algorithms in TypeScript. I made this to learn and become familiar with
TypeScript, and to have some fun with number theory. This implementation is not secure because it does not have an integer
representation of large numbers. **You should not use this code**.

Here's an example of what the API looks like:

```TypeScript
/*
    Scenario: Alice wants to send a message that only Bob
              can read, and so that Bob can be sure it
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
```

## Developing

Open a terminal in the project root and use ```npm run test-watch```. This automatically runs the test suite upon saving source code. I like to keep this terminal window on one half of my screen,
and my editor on the other half of the screen.
