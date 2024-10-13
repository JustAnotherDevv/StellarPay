
import { Account, Address, Keypair, Operation, SorobanRpc, TransactionBuilder, hash, xdr } from "@stellar/stellar-sdk";

export async function handleVoteBuild(bundlerKey: Keypair, accountContractId: string, vote: boolean) {
    const rpc = new SorobanRpc.Server(import.meta.env.VITE_PUBLIC_rpcUrl);
    const lastLedger = await rpc.getLatestLedger().then(({ sequence }) => sequence)
    const bundlerKeyAccount = await rpc.getAccount(bundlerKey.publicKey()).then((res) => new Account(res.accountId(), res.sequenceNumber()))

    const simTxn = new TransactionBuilder(bundlerKeyAccount, {
        fee: '0',
        networkPassphrase: import.meta.env.VITE_PUBLIC_networkPassphrase
    })
        .addOperation(Operation.invokeContractFunction({
            contract: import.meta.env.VITE_PUBLIC_chickenVsEggContractId,
            function: 'vote',
            args: [
                Address.fromString(accountContractId).toScVal(), 
                xdr.ScVal.scvBool(vote)
            ]
        }))
        .setTimeout(0)
        .build()

    const sim = await rpc.simulateTransaction(simTxn)

    if (
        SorobanRpc.Api.isSimulationError(sim)
        || SorobanRpc.Api.isSimulationRestore(sim)
    ) throw sim

    const authTxn = SorobanRpc.assembleTransaction(simTxn, sim).build()
    const auth = sim.result?.auth[0]!
    const authHash = hash(
        xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
            new xdr.HashIdPreimageSorobanAuthorization({
                networkId: hash(Buffer.from(import.meta.env.VITE_PUBLIC_networkPassphrase, 'utf-8')),
                nonce: auth.credentials().address().nonce(),
                signatureExpirationLedger: lastLedger + 100,
                invocation: auth.rootInvocation()
            })
        ).toXDR()
    )

    return {
        authTxn,
        authHash,
        lastLedger
    }
}