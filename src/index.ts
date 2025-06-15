import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { RECIEVER_PUB_KEY, TOKEN_MINT } from "./Var";
import { burnToken, mintToken, sendNativeToken } from "./mint";

const app = express();
app.use(express.json());
app.use(cors())

const PORT = process.env.PORT;


const Nativeexample = {
    amount: 10000000,
    fromUserAccount: 'FXN4eWDao7qUmqzdFqzPYTj48MmarpJahP6WtrKBMcgh',
    toUserAccount: 'EUZcUXgm1coo9WSWMkEfk8gwXgMYPLQM8oRYPHttDBCS'
}

const tokenTransfers = [
    {
        fromTokenAccount: 'DggPMry7wdL7M9nu1y3KpYdVfNXgyHf5RBw3fox27icc',
        fromUserAccount: 'EUZcUXgm1coo9WSWMkEfk8gwXgMYPLQM8oRYPHttDBCS',
        mint: 'Dpq3xEghwpcjkX8havhwz4RioeYUEuqx1n95zBK5hRU1',
        toTokenAccount: '4ud9JNwgJjoQgCrTaSnw66E4oP77TAtc1nGN9eGeHQvS',
        toUserAccount: 'FXN4eWDao7qUmqzdFqzPYTj48MmarpJahP6WtrKBMcgh',
        tokenAmount: 0.00001,
        tokenStandard: 'Fungible'
    }
]

app.get('/', (req: Request, res: Response) => {
    res.send("Hello World")
})

app.post('/helius', async (req: Request, res: Response) => {
    const mainData = req.body[0].nativeTransfers;
    console.log("bodyyy", req.body[0]);
    const tokenTransfers = req.body[0].tokenTransfers.find((a: any) => a.toUserAccount === RECIEVER_PUB_KEY && a.mint === TOKEN_MINT)
    const nativeTransfers = mainData.find((a: any) => a.toUserAccount === RECIEVER_PUB_KEY);
    if (!nativeTransfers && !tokenTransfers) {
        res.send("No transaction found");
        return;
    }

    const type = nativeTransfers ? "recieved_native_sol" : tokenTransfers ? "recieved_token" : null;

    if (type === "recieved_native_sol") {
        const fromAccount = nativeTransfers.fromUserAccount;
        const amount = nativeTransfers.amount;
        console.log("body", mainData);
        await mintToken(fromAccount, amount)
        res.send("Works")
    } else {
        const fromAccount = tokenTransfers.fromUserAccount;
        const amount = tokenTransfers.tokenAmount;
        await burnToken(fromAccount, amount);
        await sendNativeToken(fromAccount, amount);
    }


})

app.listen(PORT, () => console.log(`Server is running on port :${PORT}`))