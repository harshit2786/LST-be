import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js"
import { TOKEN_AUTH_PRIVATE_KEY, TOKEN_MINT } from "./Var";
import base58 from "bs58";
import { createAssociatedTokenAccount, createBurnCheckedInstruction, createTransferInstruction, getAssociatedTokenAddress, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const connection = new Connection("https://api.devnet.solana.com");

const payer = Keypair.fromSecretKey(base58.decode(TOKEN_AUTH_PRIVATE_KEY as string));
const mint = new PublicKey(TOKEN_MINT as string);

export const mintToken = async (from: string, amount: number) => {
    console.log("Token ", TOKEN_MINT)
    const receiptient = new PublicKey(from);
    try {
        const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, payer, mint, receiptient);
        await mintTo(connection, payer, mint, tokenAccount.address, payer.publicKey, amount, [], undefined, TOKEN_PROGRAM_ID);
    } catch (e) {
        console.log(e);
    }
}

export const burnToken = async (fromAddress: string, amount: number) => {
    const owner = payer.publicKey;

    const tokenAccount = await getAssociatedTokenAddress(
        mint,
        owner,
        false
    );

    const transaction = new Transaction().add(
        createBurnCheckedInstruction(
            tokenAccount,
            mint,
            owner,
            amount * 1e9,
            9,
            []
        )
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [
        payer,
    ]);
    console.log("burned tokens txns: ", signature);
};

export const sendNativeToken = async (toAddress: string, amount: number) => {
    const recipient = new PublicKey(toAddress);

    const transaction = new Transaction().add(
        SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: recipient, lamports: amount * 1e9 })
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [
        payer,
    ]);

    console.log("SOL SENT: ", signature);
};