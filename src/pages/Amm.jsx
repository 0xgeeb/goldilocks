import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import abi from "../utils/testAMM.json"

export default function Amm({ currentAccount, setCurrentAccount, avaxChain, setAvaxChain }) {

  const [fsl, setFsl] = useState(null)
  const [psl, setPsl] = useState(null)
  const [lastFloorRaise, setLastFloorRaise] = useState(null)
  const [targetRatio, setTargetRatio] = useState(null)
  const [buy, setBuy] = useState()
  const [sell, setSell] = useState()
  const [redeem, setRedeem] = useState()

  useEffect(() => {
    getContractData()
  }, [])

  const numFor = Intl.NumberFormat('en-US')

  const quickNodeFuji = {
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

  const fuji = {
    chainId: '0xA869',
    chainName: 'Fuji (C-Chain)',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18
    },
    rpcUrls: ['https://api.avax-test.network/ext/C/rpc'],
    blockExplorerUrls: ['https://testnet.snowtrace.io']
  }

  const contractAddy = '0xD323ba82A0ec287C9D19c63C439898720a93604A'
  

  async function connectWallet() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    setCurrentAccount(accounts[0])
  }

  async function switchToFuji() {
    await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [fuji] })
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    if (chainId === 43113) {
      setAvaxChain(chainId);
    };
  }

  async function getContractData() {
    const provider = new ethers.providers.JsonRpcProvider(quickNodeFuji.rpcUrls[0])
    const contractObject = new ethers.Contract(contractAddy, abi.abi, provider)
    const fslReq = await contractObject.fsl()
    const pslReq = await contractObject.psl()
    // const floorReq = await contractObject.lastFloorRaise()
    const ratioReq = await contractObject.targetRatio()
    setFsl(parseInt(fslReq._hex, 16))
    setPsl(parseInt(pslReq._hex, 16))
    // setLastFloorRaise(new Date(parseInt(floorReq._hex, 16)*1000).toLocaleString())
    setTargetRatio(parseInt(ratioReq._hex, 16))
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

  function renderContent() {
    if(!currentAccount) {
      return (
        <div className="mt-8 flex flex-col">
          <h1 className="mx-auto">please connect wallet</h1>
          <button className="px-8 py-2 bg-slate-200 hover:bg-slate-500 rounded-xl mx-auto mt-6" onClick={connectWallet}>connect wallet</button>
        </div>
      )
    }
    else if(!avaxChain) {
      return (
        <div className="mt-8 flex flex-col">
          <h1 className="mx-auto">please switch to fuji</h1>
          <button className="px-8 py-2 bg-slate-200 hover:bg-slate-500 rounded-xl mx-auto mt-6" onClick={switchToFuji}>switch to fuji</button>
        </div>
      )
    }
    else {
      return (
        <div>
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
        </div>
      )
    }
  }

  return (
    <div className="flex flex-row">
      <div className="w-[45%] flex flex-col p-4 rounded-xl bg-yellow-100 ml-24 mt-24 h-[600px]" id="card-div-shadow">
      <h2 className="mx-auto text-xl">amm</h2>
        { renderContent() }
        <div className="flex justify-around flex-row items-center mt-14">
          <p>fsl</p>
          <p>{ fsl && numFor.format((fsl / Math.pow(10, 18))) }</p>
        </div>
        <div className="flex justify-around flex-row items-center mt-8">
          <p>psl</p>
          <p>{ psl && numFor.format((psl / Math.pow(10, 18))) }</p>
        </div>
        <div className="flex justify-around flex-row items-center mt-8">
          <p>last floor raise</p>
          <p></p>
        </div>
        <div className="flex justify-around flex-row items-center mt-8">
          <p>target ratio</p>
          <p>{ targetRatio && (targetRatio / 10**16)+"%" }</p>
        </div>
      </div>
    </div>
  )
}