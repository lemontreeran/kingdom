import { Prisma } from './generated/prisma'
import {
    Asset,
    Keypair,
    Memo,
    Network,
    Server,
    TransactionBuilder,
    Operation } from '@kinecosystem/kin-sdk'

export interface Context {
  db: Prisma
  request: any
}

export async function createKinWallet(newWallet){
          try {
              // const network = KinNetwork.Testnet
              // let wallet:KinWallet | undefined
              // createWallet(network, keypair).then(w=>{
              //     console.log(w)
              //     wallet = w
              // })

              const kinServer = new Server('https://horizon-testnet.kininfrastructure.com');

              // Uncomment the following line to build transactions for the live network. Be
              // sure to also change the horizon hostname.
              // StellarSdk.Network.usePublicNetwork();
              Network.useTestNetwork();
              //GAEN2UZMBZLUGGQ6RK5UUXVLY3IUOQAOOL3ESFHNJID6TLJN6FYUP6L5
              const sourceKeyPair = Keypair.fromSecret('SBEDB22VBJ3MQCPPLPHN2JZMJO24H7D7TPHWFIBYS6NZC7NEXI76PLZL')
              const source = await kinServer.loadAccount(sourceKeyPair.publicKey())

              console.log('creating account in ledger', newWallet)

              const transaction = new TransactionBuilder(source)
                  .addOperation(
                      Operation.createAccount({
                          destination: newWallet,
                          startingBalance: '2'
                      }))
                   // Wait a maximum of three minutes for the transaction
                  .setTimeout(180)
                  .build()

              transaction.sign(sourceKeyPair)

              const result = await kinServer.submitTransaction(transaction);
              console.log('Account created: ', result)
                                          } catch (e) {
                                              console.log('Kin account not created.', e)
                                          }
}
