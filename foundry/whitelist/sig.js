const ethers = require('ethers')

const privateKey = ''

const proposalId = 1
const support = 1

async function signMessage() {
  const wallet = new ethers.Wallet(privateKey)

  const messageHash = ethers.solidityPackedKeccak256(['uint256', 'uint8'], [proposalId, support])

  const signature = await wallet.signMessage(ethers.getBytes(messageHash))

  const { v, r, s } = ethers.Signature.from(signature)

  console.log('v:', v)
  console.log('r:', r)
  console.log('s:', s)
}

signMessage()