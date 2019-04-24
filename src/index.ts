import { GraphQLServer } from 'graphql-yoga'
import { importSchema } from 'graphql-import'
import { Prisma } from './generated/prisma'
import { Context, createKinWallet } from './utils'
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

          await createKinWallet(keypair.publicKey());

          return user
      },

      async payment(_, { amount, senderName, recipientName, memo }, context: Context, info ){
          const result = await context.db.query.users({
              where: {
                  username_in: [senderName, recipientName]
              }
          })

          const [recipient, sender] = result
          // const [sender, recipient] = result

          const kinServer = new Server('https://horizon-testnet.kininfrastructure.com');
          Network.useTestNetwork();

          const signerKeys = Keypair.fromSecret(
              // Use something like KMS in productions
              AES.decrypt(
                  sender.kinSeed,
                  ENVCryptoSecret
              ).toString(enc.Utf8)
          )

          const account = await kinServer.loadAccount(sender.kinAccount)

          console.log('load sender account in ledger', sender.kinAccount)

          const asset = Asset.native()

          let transaction = new TransactionBuilder(account)
              .addOperation(
                  Operation.payment({
                      destination: recipient.kinAccount,
                      asset,
                      amount
                  }))
              .setTimeout(180)
              .addMemo(Memo.text('http://tiny.cc/d2t44y'))
          // Wait a maximum of three minutes for the transaction
              .build()

          transaction.sign(signerKeys)

          try {
              const { hash } = await kinServer.submitTransaction(transaction)

              return { id: hash }
          } catch (e) {
              console.log(`failure ${e}`)

              throw e
          }
      }
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
