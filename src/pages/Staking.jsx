import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import abi from "../utils/testAMM.json"
import coolWithBear from "../images/cool_with_bear.png"

export default function Staking({ currentAccount, setCurrentAccount, avaxChain, setAvaxChain }) {
  
  const [stake, setStake] = useState()
  const [unstake, setUnstake] = useState()
  const [claim, setClaim] = useState()
  const [realize, setRealize] = useState()
  const [staked, setStaked] = useState()
  const [stakeToggle, setStakeToggle] = useState(true)
  const [unstakeToggle, setUnstakeToggle] = useState(false)
  const [claimToggle, setClaimToggle] = useState(false)
  const [realizeToggle, setRealizeToggle] = useState(false)

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

  function handlePill(action) {
    setStake('')
    setUnstake('')
    setClaim('')
    setRealize('')
    if(action === 1) {
      setStakeToggle(true)
      setUnstakeToggle(false)
      setClaimToggle(false)
      setRealizeToggle(false)
    }
    if(action === 2) {
      setStakeToggle(false)
      setUnstakeToggle(true)
      setClaimToggle(false)
      setRealizeToggle(false)
    }
    if(action === 3) {
      setStakeToggle(false)
      setUnstakeToggle(false)
      setClaimToggle(true)
      setRealizeToggle(false)
    }
    if(action === 4) {
      setStakeToggle(false)
      setUnstakeToggle(false)
      setClaimToggle(false)
      setRealizeToggle(true)
    }
  }
  
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
    // const stakedReq = await contractObject.getStaked(currentAccount)
    // setStaked(parseInt(stakedReq._hex, 16))
  }

  async function stakeFunctionInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contractObjectSigner = new ethers.Contract(contractAddy, abi.abi, signer)
    const stakeTx = await contractObjectSigner.stake(stake)
    stakeTx.wait()
  }

  async function unstakeFunctionInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contractObjectSigner = new ethers.Contract(contractAddy, abi.abi, signer)
    const unstakeTx = await contractObjectSigner.unstake(unstake)
    unstakeTx.wait()
  }

  async function realizeFunctionInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contractObjectSigner = new ethers.Contract(contractAddy, abi.abi, signer)
    const realizeTx = await contractObjectSigner.realize(realize)
    realizeTx.wait()
  }

  async function claimFunctionInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contractObjectSigner = new ethers.Contract(contractAddy, abi.abi, signer)
    const claimTx = await contractObjectSigner.claim()
    claimTx.wait()
  }

  function handleButtonClick() {

  }

  function renderButton() {

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
            <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={() => stakeFunctionInteraction}>stake</button>
            <input type="number" value={stake} id="input" className="w-24 pl-3 rounded" onChange={(e) => setStake(e.target.value)}/>
          </div>
          <div className="flex justify-around flex-row items-center mt-8">
            <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={() => unstakeFunctionInteraction}>unstake</button>
            <input type="number" value={unstake} id="input" className="w-24 pl-3 rounded" onChange={(e) => setUnstake(e.target.value)}/>
          </div>
          <div className="flex justify-around flex-row items-center mt-8">
            <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={() => realizeFunctionInteraction}>realize</button>
            <input type="number" value={realize} id="input" className="w-24 pl-3 rounded" onChange={(e) => setRealize(e.target.value)}/>
          </div>
          <div className="flex justify-around flex-row items-center mt-8">
            <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={() => claimFunctionInteraction}>claim yield</button>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="flex flex-row py-3">
      <div className="w-[57%] flex flex-col pt-8 pb-2 px-16 rounded-xl bg-slate-300 ml-24 mt-12 h-[700px] border-2 border-black">
        <h1 className="text-[50px] font-acme text-[#ffff00]" id="text-outline">goldilocks stake</h1>
        <div className="flex flex-row ml-2 items-center justify-between">
          <h3 className="font-acme text-[24px] ml-2">staking $locks for $porridge</h3>
          <div className="flex flex-row bg-white rounded-2xl border-2 border-black">
            <div className={`font-acme w-20 py-2 ${stakeToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(1)}>stake</div>
            <div className={`font-acme w-20 py-2 ${unstakeToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(2)}>unstake</div>
            <div className={`font-acme w-20 py-2 ${claimToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(3)}>claim</div>
            <div className={`font-acme w-20 py-2 ${realizeToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-r-2xl text-center cursor-pointer`} onClick={() => handlePill(4)}>realize</div>
          </div>
        </div>
        <div className="h-[100%] mt-4 flex flex-row">
          <div className="w-[60%] flex justify-center flex-col">
            <div className="rounded-3xl border-2 border-black w-[100%] h-[75%] bg-white flex flex-col">
            
            </div>
            <div className="h-[15%] w-[80%] mx-auto mt-6">
              <button className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[30px]" id="amm-button" onClick={() => handleButtonClick()} >{renderButton()}</button>
            </div>
          </div>
          <div className="w-[40%] h-[50%] flex p-6 flex-col bg-white rounded-xl border-2 border-black ml-4 mt-4">
            <div className="flex flex-row justify-between items-center">
              <h1 className="font-acme text-[24px]">$LOCKS balance:</h1>
              <p className="font-acme text-[20px]">100</p>
            </div>
            <div className="flex flex-row justify-between items-center mt-8">
              <h1 className="font-acme text-[24px]">$PRG balance:</h1>
              <p className="font-acme text-[20px]">100</p>
            </div>
            <h1 className="font-acme text-[20px] mt-16">$PRG available to claim:</h1>
          </div>
        </div>
      </div>
      <div className="w-[30%]">
        <img className="h-[70%] w-[36%] absolute bottom-0 right-0" src={coolWithBear} />
      </div>
    </div>
  )
}