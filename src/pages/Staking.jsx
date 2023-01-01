import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import Bear from "../components/Bear.jsx"
import abi from "../utils/Porridge.json"
import LocksABI from "../utils/Locks.json"

export default function Staking({ currentAccount, setCurrentAccount, avaxChain, setAvaxChain }) {
  
  const [input, setInput] = useState()
  const [staked, setStaked] = useState()
  const [locksBalance, setLocksBalance] = useState()
  const [porridgeBalance, setPorridgeBalance] = useState()
  const [claimBalance, setClaimBalance] = useState()
  const [stakeToggle, setStakeToggle] = useState(true)
  const [unstakeToggle, setUnstakeToggle] = useState(false)
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

  const contractAddy = '0xd8A4b467d6B653253D0c89CC49EAB6c6A5aB3067'
  const LocksContractAddy = '0x189C988A4915f37694C8D14ae025268e3250b6e8'

  function handlePill(action) {
    setInput('')
    if(action === 1) {
      setStakeToggle(true)
      setUnstakeToggle(false)
      setRealizeToggle(false)
    }
    if(action === 2) {
      setStakeToggle(false)
      setUnstakeToggle(true)
      setRealizeToggle(false)
    }
    if(action === 3) {
      setStakeToggle(false)
      setUnstakeToggle(false)
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
    if(currentAccount) {
      const LocksContractObject = new ethers.Contract(LocksContractAddy, LocksABI.abi, provider)
      const locksBalanceReq = await LocksContractObject.balanceOf(currentAccount)
      setLocksBalance(parseInt(locksBalanceReq._hex, 16) / Math.pow(10, 18))
      const stakedReq = await contractObject.getStaked(currentAccount)
      setStaked(parseInt(stakedReq._hex, 16) / Math.pow(10, 18))
      const porridgeBalanceReq = await contractObject.balanceOf(currentAccount)
      setPorridgeBalance(parseInt(porridgeBalanceReq._hex, 16) / Math.pow(10, 18))
      const claimBalanceReq = await contractObject._calculateYield(currentAccount)
      setClaimBalance(parseInt(claimBalanceReq._hex, 16) / Math.pow(10, 18))
    }
  }

  async function stakeFunctionInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contractObjectSigner = new ethers.Contract(contractAddy, abi.abi, signer)
    const stakeTx = await contractObjectSigner.stake(ethers.utils.parseUnits(input, 18))
    stakeTx.wait()
  }

  async function unstakeFunctionInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contractObjectSigner = new ethers.Contract(contractAddy, abi.abi, signer)
    const unstakeTx = await contractObjectSigner.unstake(ethers.utils.parseUnits(input, 18))
    unstakeTx.wait()
  }

  async function realizeFunctionInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contractObjectSigner = new ethers.Contract(contractAddy, abi.abi, signer)
    const realizeTx = await contractObjectSigner.realize(ethers.utils.parseUnits(input, 18))
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
    if(!currentAccount) {
      connectWallet()
    }
    else if(!avaxChain) {
      switchToFuji()
    }
    else {
      if(stakeToggle) {
        stakeFunctionInteraction()
      }
      if(unstakeToggle) {
        unstakeFunctionInteraction()
      }
      if(realizeToggle) {
        realizeFunctionInteraction()
      }
    }
  }

  function renderButton() {
    if(!currentAccount) {
      return 'connect wallet'
    }
    else if(!avaxChain) {
      return 'switch to fuji plz'
    }
    else {
      if(stakeToggle) {
        return 'stake'
      }
      if(unstakeToggle) {
        return 'unstake'
      }
      if(realizeToggle) {
        return 'realize'
      }
    }
  }

  function renderLabel() {
    if(stakeToggle) {
      return 'stake'
    }
    if(unstakeToggle) {
      return 'unstake'
    }
    if(realizeToggle) {
      return 'realize'
    }
  }

  return (
    <div className="flex flex-row py-3">
      <div className="w-[57%] flex flex-col pt-8 pb-2 px-16 rounded-xl bg-slate-300 ml-24 mt-12 h-[700px] border-2 border-black">
        <h1 className="text-[50px] font-acme text-[#ffff00]" id="text-outline">staking</h1>
        <div className="flex flex-row ml-2 items-center justify-between">
          <h3 className="font-acme text-[24px] ml-2">staking $locks for $porridge</h3>
          <div className="flex flex-row bg-white rounded-2xl border-2 border-black">
            <div className={`font-acme w-20 py-2 ${stakeToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(1)}>stake</div>
            <div className={`font-acme w-20 py-2 ${unstakeToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(2)}>unstake</div>
            <div className={`font-acme w-20 py-2 ${realizeToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-r-2xl text-center cursor-pointer`} onClick={() => handlePill(3)}>realize</div>
          </div>
        </div>
        <div className="h-[100%] mt-4 flex flex-row">
          <div className="w-[60%] flex flex-col">
            <div className="rounded-3xl border-2 border-black w-[100%] h-[60%] bg-white flex flex-col relative">
              <h1 className="font-acme text-[40px] ml-10 mt-16">{renderLabel()}</h1>
              <div className="absolute top-[45%]">
                <input className="border-none focus:outline-none font-acme rounded-xl text-[40px] pl-10" placeholder="0" type="number" value={input} onChange={(e) => setInput(e.target.value)} id="number-input" autoFocus />
              </div>
            </div>
            <div className="h-[15%] w-[80%] mx-auto mt-6">
              <button className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[30px]" id="amm-button" onClick={() => handleButtonClick()} >{renderButton()}</button>
            </div>
          </div>
          <div className="flex flex-col w-[40%] h-[100%] mt-4 ml-4">
            <div className="w-[100%] h-[50%] flex p-6 flex-col bg-white rounded-xl border-2 border-black">
              <div className="flex flex-row justify-between items-center">
                <h1 className="font-acme text-[24px]">$LOCKS balance:</h1>
                <p className="font-acme text-[20px]">{locksBalance ? locksBalance : 0}</p>
              </div>
              <div className="flex flex-row justify-between items-center mt-3">
                <h1 className="font-acme text-[24px]">staked $LOCKS:</h1>
                <p className="font-acme text-[20px]">{staked ? staked : 0}</p>
              </div>
              <div className="flex flex-row justify-between items-center mt-3">
                <h1 className="font-acme text-[24px]">$PRG balance:</h1>
                <p className="font-acme text-[20px]">{porridgeBalance ? porridgeBalance : 0}</p>
              </div>
              <div className="flex flex-row justify-between items-center mt-8">
                <h1 className="font-acme text-[20px]">$PRG available to claim:</h1>
                <p className="font-acme text-[20px]">{claimBalance ? claimBalance : 0}</p>
              </div>
            </div>
            {currentAccount && avaxChain && <div className="h-[10%] w-[70%] mx-auto mt-4">
              <button className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[25px]" id="amm-button" onClick={() => claimFunctionInteraction()} >claim yield</button>
            </div>}
          </div>
        </div>
      </div>
      <Bear />
    </div>
  )
}