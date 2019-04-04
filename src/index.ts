import { GraphQLServer } from 'graphql-yoga'
import { importSchema } from 'graphql-import'
import { Prisma } from './generated/prisma'
import { Context } from './utils'
import {
    Asset,
    Keypair,
    Memo,
    Network,
    Server,
    TransactionBuilder,
    Operation } from '@kinecosystem/kin-sdk'
import { AES, enc } from 'crypto-js'

const ENVCryptoSecret = 'Do-not-put-value-in-here'

const resolvers = {
  Query: {
      // 
      // 'info' contains information about the execution state of the query
      user(_, { username }, context: Context, info) {
          return context.db.query.user(
              {
                  where: {
                      username
                  }
              },
              info
          )
      }
  },
  Mutation: {
      async signup(_, { username }, context: Context, info) {
          const keypair = Keypair.random()

          const secret = AES.encrypt(
              keypair.secret(),
              ENVCryptoSecret
          ).toString()

          const data = {
              username,
              kinAccount: keypair.publicKey(),
              kinSeed: secret
          }

          const user = await context.db.mutation.createUser(
              { data },
              info
          )

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
              const sourceKeyPair = Keypair.fromSecret('SDYYUXB7TNEFBIXJLCGP72SPUOIQSUXDO32A2U6T3USSFOVEQFHPPBCW')
              const source = await kinServer.loadAccount(sourceKeyPair.publicKey())

              console.log('creating account in ledger', keypair.publicKey())

              const transaction = new TransactionBuilder(source)
                  .addOperation(
                      Operation.createAccount({
                          destination: keypair.publicKey(),
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

          return user
      },
  },
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      endpoint: 'https://us1.prisma.sh/public-gravelcloud-78/kingdom/dev', // the endpoint of the Prisma API
      debug: true, // log all GraphQL queries & mutations sent to the Prisma API
      // secret: 'mysecret123', // only needed if specified in `database/prisma.yml`
    }),
  }),
})
server.start(() => console.log('Server is running on http://localhost:4000'))
