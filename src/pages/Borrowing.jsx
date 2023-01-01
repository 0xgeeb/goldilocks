import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import Bear from "../components/Bear.jsx"
import abi from "../utils/Borrow.json"
import LocksABI from "../utils/Locks.json"
import PorridgeABI from "../utils/Porridge.json"

export default function Borrowing({ currentAccount, setCurrentAccount, avaxChain, setAvaxChain }) {

  const [input, setInput] = useState()
  const [locked, setLocked] = useState()
  const [staked, setStaked] = useState()
  const [borrowed, setBorrowed] = useState()
  const [locksBalance, setLocksBalance] = useState()
  const [borrowToggle, setBorrowToggle] = useState(true)
  const [repayToggle, setRepayToggle] = useState(false)

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

  const contractAddy = '0x9494a50Ab61492194c7b0897CE36F8147a90b28a'
  const LocksContractAddy = '0x189C988A4915f37694C8D14ae025268e3250b6e8'
  const PorridgeContractAddy = '0xd8A4b467d6B653253D0c89CC49EAB6c6A5aB3067'
  

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
      const PorridgeContractObject = new ethers.Contract(PorridgeContractAddy, PorridgeABI.abi, provider)
      const locksBalanceReq = await LocksContractObject.balanceOf(currentAccount)
      setLocksBalance(parseInt(locksBalanceReq._hex, 16) / Math.pow(10, 18))
      const stakedReq = await PorridgeContractObject.getStaked(currentAccount)
      setStaked(parseInt(stakedReq._hex, 16) / Math.pow(10, 18))
      const borrowedReq = await contractObject.getBorrowed(currentAccount)
      const lockedReq = await contractObject.getlocked(currentAccount)
      setBorrowed(parseInt(borrowedReq._hex, 16))
      setLocked(parseInt(lockedReq._hex, 16))
    }
  }

  async function borrowFunctionInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contractObjectSigner = new ethers.Contract(contractAddy, abi.abi, signer)
    const borrowTx = await contractObjectSigner.borrow(ethers.utils.parseUnits(input, 18))
    borrowTx.wait()
  }

  async function repayFunctionInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const contractObjectSigner = new ethers.Contract(contractAddy, abi.abi, signer)
    const repayTx = await contractObjectSigner.repay(ethers.utils.parseUnits(input, 18))
    repayTx.wait()
  }

  function handlePill(action) {
    if(action === 1) {
      setBorrowToggle(true)
      setRepayToggle(false)
    }
    if(action === 2) {
      setBorrowToggle(false)
      setRepayToggle(true)
    }
  }

  function handleButtonClick() {
    if(!currentAccount) {
      connectWallet()
    }
    else if(!avaxChain) {
      switchToFuji()
    }
    else {
      if(borrowToggle) {
        borrowFunctionInteraction()
      }
      if(repayToggle) {
        repayFunctionInteraction()
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
      if(borrowToggle) {
        return 'borrow'
      }
      if(repayToggle) {
        return 'repay'
      }
    }
  }

  function renderLabel() {
    if(borrowToggle) {
      return 'borrow'
    }
    if(repayToggle) {
      return 'repay'
    }
  }

  return (
    <div className="flex flex-row py-3">
      <div className="w-[57%] flex flex-col pt-8 pb-2 px-24 rounded-xl bg-slate-300 ml-24 mt-12 h-[700px] border-2 border-black">
        <h1 className="text-[50px] font-acme text-[#ffff00]" id="text-outline">borrowing</h1>
        <div className="flex flex-row ml-2 items-center justify-between">
          <h3 className="font-acme text-[24px] ml-2">lock staked $locks and borrow $honey</h3>
          <div className="flex flex-row bg-white rounded-2xl border-2 border-black">
            <div className={`font-acme w-20 py-2 ${borrowToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(1)}>borrow</div>
            <div className={`font-acme w-20 py-2 ${repayToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center rounded-r-2xl cursor-pointer`} onClick={() => handlePill(2)}>repay</div>
          </div>
        </div>
        <div className="flex flex-row mt-4 h-[100%] justify-between">
          <div className="flex flex-col h-[100%] w-[60%]">
            <div className="bg-white border-2 border-black rounded-xl h-[70%] relative">
            <h1 className="font-acme text-[40px] ml-10 mt-16">{renderLabel()}</h1>
              <div className="absolute top-[45%]">
                <input className="border-none focus:outline-none font-acme rounded-xl text-[40px] pl-10" placeholder="0" type="number" value={input} onChange={(e) => setInput(e.target.value)} id="number-input" autoFocus />
              </div>
            </div>
            <div className="h-[15%] w-[80%] mx-auto mt-6">
              <button className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[30px]" id="amm-button" onClick={() => handleButtonClick()} >{renderButton()}</button>
            </div>
          </div>
          <div className="w-[35%] h-[60%] bg-white border-2 border-black rounded-xl flex flex-col px-6 py-10">
            <div className="flex flex-row justify-between items-center">
              <h1 className="font-acme text-[24px]">$LOCKS balance:</h1>
              <p className="font-acme text-[20px]">{locksBalance ? locksBalance : 0}</p>
            </div>
            <div className="flex flex-row justify-between items-center mt-6">
              <h1 className="font-acme text-[24px]">staked $LOCKS:</h1>
              <p className="font-acme text-[20px]">{staked ? staked : 0}</p>
            </div>
            <div className="flex flex-row justify-between items-center mt-6">
              <h1 className="font-acme text-[24px]">locked $LOCKS:</h1>
              <p className="font-acme text-[20px]">{locked ? locked : 0}</p>
            </div>
            <div className="flex flex-row justify-between items-center mt-6">
              <h1 className="font-acme text-[24px]">borrowed $HONEY:</h1>
              <p className="font-acme text-[20px]">{borrowed ? borrowed : 0}</p>
            </div>
          </div>
        </div>
      </div>
      <Bear />
    </div>
  )
}