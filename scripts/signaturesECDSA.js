require('dotenv').config()
const { ethers } = require('ethers')
const fs = require('fs')
const addresses = require('./whitelist.json')

async function main() {
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY_TEST_HARDHAT)
  let signedMessages = {}

  // Sign messages whitelisted users. These signatures will allow to vote.
  for (const address of addresses) {
    const addressHash = ethers.utils.solidityKeccak256(
      ['address'],
      [address.address],
    )
    const messageBytes = ethers.utils.arrayify(addressHash)
    signature = await signer.signMessage(messageBytes)
    signedMessages[address.address] = signature
  }

  fs.writeFileSync(
    './signatures.json',
    JSON.stringify(signedMessages, null, 2),
    'utf8',
  )
  console.log('Signatures Written > `./signatures.json`')
}

// We recommend this pattern to be able to use async/await everywhere and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
