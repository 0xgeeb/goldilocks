import React, { useEffect, useState } from "react"
import { ethers } from "ethers"

export default function Borrowing() {

  const [currentAccount, setCurrentAccount] = useState(null)
  const [avaxChain, setAvaxChain] = useState(null)
  const [contract, setContract] = useState(null)
  const [borrow, setBorrow] = useState()
  const [repay, setRepay] = useState()
  const [locked, setLocked] = useState()
  const [borrowed, setBorrowed] = useState()

  useEffect(() => {
    getContractData()
  }, [])

  const numFor = Intl.NumberFormat('en-US')

  const fuji = {
    chainId: '0xA869',
    chainName: 'Fuji (C-Chain)',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18
    },
    rpcUrls: ['https://young-methodical-spree.avalanche-testnet.discover.quiknode.pro/e9ef57f113488a9db47c13766faa54b868f93ea9/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://testnet.snowtrace.io']
  }

  const contractAddy = '0xD323ba82A0ec287C9D19c63C439898720a93604A'
  

  async function connectWallet() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = accounts[0]
    setCurrentAccount(account)
  }

  async function switchToFuji() {
    await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [fuji] })
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    if (chainId === 43114) {
      setAvaxChain(chainId);
    };
  }

  async function getContractData() {
    const provider = new ethers.providers.JsonRpcProvider(fuji.rpcUrls[0])
    const contractObject = new ethers.Contract(contractAddy, abi.abi, provider)
    const borrowedReq = await contractObject.getBorrowed(account)
    const lockedReq = await contractObject.getlocked(account)
    setBorrowed(parseInt(borrowedReq._hex, 16))
    setLocked(parseInt(lockedReq._hex, 16))
  }

  async function borrowFunctionInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contractObjectSigner = new ethers.Contract(contractAddy, abi.abi, signer)
    const borrowTx = await contractObjectSigner.borrow(borrow)
    borrowTx.wait()
  }

  async function repayFunctionInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contractObjectSigner = new ethers.Contract(contractAddy, abi.abi, signer)
    const repayTx = await contractObjectSigner.repay(repay)
    repayTx.wait()
  }

  return (
    <div className="flex flex-row">
      <div className="w-[45%] flex flex-col p-4 rounded-xl bg-yellow-100 ml-24 mt-24 h-[600px]" id="card-div-shadow">
        <h2 className="mx-auto text-xl">borrow</h2>
        <div className="flex justify-around flex-row items-center mt-8">
          <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={() => borrowFunctionInteraction}>borrow</button>
          <input type="number" value={borrow} id="input" className="w-24 pl-3 rounded" onChange={(e) => setBorrow(e.target.value)}/>
        </div>
        <div className="flex justify-around flex-row items-center mt-8">
          <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={() => repayFunctionInteraction}>repay</button>
          <input type="number" value={repay} id="input" className="w-24 pl-3 rounded" onChange={(e) => setRepay(e.target.value)}/>
        </div>
        <div className="flex justify-around flex-row items-center mt-14">
          <p>borrowed</p>
          <p>{ borrowed && numFor.format((borrowed / Math.pow(10, 18))) }</p>
        </div>
        <div className="flex justify-around flex-row items-center mt-14">
          <p>locked</p>
          <p>{ locked && numFor.format((locked / Math.pow(10, 18))) }</p>
        </div>
      </div>
    </div>
  )
}