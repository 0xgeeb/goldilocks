import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import abi from "../utils/testAMM.json"
import coolWithBear from "../images/cool_with_bear.png"

export default function Borrowing({ currentAccount, setCurrentAccount, avaxChain, setAvaxChain }) {

  const [borrow, setBorrow] = useState()
  const [repay, setRepay] = useState()
  const [locked, setLocked] = useState()
  const [borrowed, setBorrowed] = useState()

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
    // const borrowedReq = await contractObject.getBorrowed(currentAccount)
    // const lockedReq = await contractObject.getlocked(currentAccount)
    // setBorrowed(parseInt(borrowedReq._hex, 16))
    // setLocked(parseInt(lockedReq._hex, 16))
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

  // function renderContent() {
  //   if(!currentAccount) {
  //     return (
  //       <div className="mt-8 flex flex-col">
  //         <h1 className="mx-auto">please connect wallet</h1>
  //         <button className="px-8 py-2 bg-slate-200 hover:bg-slate-500 rounded-xl mx-auto mt-6" onClick={connectWallet}>connect wallet</button>
  //       </div>
  //     )
  //   }
  //   else if(!avaxChain) {
  //     return (
  //       <div className="mt-8 flex flex-col">
  //         <h1 className="mx-auto">please switch to fuji</h1>
  //         <button className="px-8 py-2 bg-slate-200 hover:bg-slate-500 rounded-xl mx-auto mt-6" onClick={switchToFuji}>switch to fuji</button>
  //       </div>
  //     )
  //   }
  //   else {
  //     return (
  //       <div>
  //         <div className="flex justify-around flex-row items-center mt-8">
  //           <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={() => borrowFunctionInteraction}>borrow</button>
  //           <input type="number" value={borrow} id="input" className="w-24 pl-3 rounded" onChange={(e) => setBorrow(e.target.value)}/>
  //         </div>
  //         <div className="flex justify-around flex-row items-center mt-8">
  //           <button className="px-12 py-3 w-36 bg-slate-200 hover:bg-slate-500 rounded-xl" onClick={() => repayFunctionInteraction}>repay</button>
  //           <input type="number" value={repay} id="input" className="w-24 pl-3 rounded" onChange={(e) => setRepay(e.target.value)}/>
  //         </div>
  //       </div>
  //     )
  //   }
  // }

  return (
    <div className="flex flex-row py-3">
      <div className="w-[57%] flex flex-col pt-8 pb-2 px-24 rounded-xl bg-slate-300 ml-24 mt-12 h-[700px] border-2 border-black">
        <h2 className="mx-auto text-xl">borrow</h2>
        
        <div className="flex justify-around flex-row items-center mt-14">
          <p>borrowed</p>
          <p>{ borrowed && numFor.format((borrowed / Math.pow(10, 18))) }</p>
        </div>
        <div className="flex justify-around flex-row items-center mt-14">
          <p>locked</p>
          <p>{ locked && numFor.format((locked / Math.pow(10, 18))) }</p>
        </div>
      </div>
        <div className="w-[30%]">
          <img className="h-[70%] w-[36%] absolute bottom-0 right-0" src={coolWithBear} />
        </div>
    </div>
  )
}