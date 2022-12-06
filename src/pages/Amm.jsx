import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import abi from "../utils/testAMM.json"

export default function Amm() {

  const [currentAccount, setCurrentAccount] = useState(null)
  const [avaxChain, setAvaxChain] = useState(null)
  const [contract, setContract] = useState(null)
  const [fsl, setFsl] = useState(null)
  const [psl, setPsl] = useState(null)
  const [something, setSomething] = useState(null)
  const [buy, setBuy] = useState()
  const [sell, setSell] = useState()
  const [redeem, setRedeem] = useState()

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
    const fslReq = await contractObject.fsl()
    const pslReq = await contractObject.psl()
    const somethingReq = await contractObject.something()
    setFsl(parseInt(fslReq._hex, 16))
    setPsl(parseInt(pslReq._hex, 16))
    setSomething(parseInt(somethingReq._hex, 16))
  }

  async function buyFunctionInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contractObjectSigner = new ethers.Contract(contractAddy, abi.abi, signer)
    const buyTx = await contractObjectSigner.buy(buy)
    buyTx.wait()
  }

  async function sellFunctionInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contractObjectSigner = new ethers.Contract(contractAddy, abi.abi, signer)
    const sellTx = await contractObjectSigner.sell(sell)
    sellTx.wait()
  }

  async function redeemFunctionInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contractObjectSigner = new ethers.Contract(contractAddy, abi.abi, signer)
    const redeemTx = await contractObjectSigner.redeem(redeem)
    redeemTx.wait()
  }


  return (
    <div className="flex flex-row">
      <div className="w-[45%] flex flex-col p-4 rounded-xl bg-yellow-100 ml-24 mt-24 h-[600px]" id="card-div-shadow">
        <h2 className="mx-auto text-xl">amm</h2>
        <div className="flex justify-around flex-row items-center mt-8">
          <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={() => buyFunctionInteraction}>buy</button>
          <input type="number" value={buy} id="input" className="w-24 pl-3 rounded" onChange={(e) => setBuy(e.target.value)}/>
        </div>
        <div className="flex justify-around flex-row items-center mt-8">
          <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={() => sellFunctionInteraction}>sell</button>
          <input type="number" value={sell} id="input" className="w-24 pl-3 rounded" onChange={(e) => setSell(e.target.value)}/>
        </div>
        <div className="flex justify-around flex-row items-center mt-8">
          <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={() => redeemFunctionInteraction}>redeem</button>
          <input type="number" value={redeem} id="input" className="w-24 pl-3 rounded" onChange={(e) => setRedeem(e.target.value)}/>
        </div>
        <div className="flex justify-around flex-row items-center mt-14">
          <p>fsl</p>
          <p>{ fsl && numFor.format((fsl / Math.pow(10, 18))) }</p>
        </div>
        <div className="flex justify-around flex-row items-center mt-14">
          <p>psl</p>
          <p>{ psl && numFor.format((psl / Math.pow(10, 18))) }</p>
        </div>
        <div className="flex justify-around flex-row items-center mt-14">
          <p>something</p>
          <p>{ something && numFor.format(something) }</p>
        </div>
      </div>
    </div>
  )
}