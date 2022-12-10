import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import abi from "../utils/testAMM.json"

export default function Staking() {
  
  const [currentAccount, setCurrentAccount] = useState(null)
  const [avaxChain, setAvaxChain] = useState(null)
  const [contract, setContract] = useState(null)
  const [stake, setStake] = useState();
  const [unstake, setUnstake] = useState();
  const [realize, setRealize] = useState();
  const [staked, setStaked] = useState();

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
    const stakedReq = await contractObject.getStaked(account)
    setStaked(parseInt(stakedReq._hex, 16))
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

  return (
    <div className="flex flex-row">
      <div className="w-[45%] flex flex-col p-4 rounded-xl bg-yellow-100 ml-24 mt-24 h-[600px]" id="card-div-shadow">
        <h2 className="mx-auto text-xl">staking</h2>
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
        <div className="flex justify-around flex-row items-center mt-14">
          <p>staked</p>
          <p>{ staked && numFor.format((staked / Math.pow(10, 18))) }</p>
        </div>
      </div>
    </div>
  )
}