import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import abi from "../utils/testAMM.json"
import coolWithBear from "../images/cool_with_bear.png"

export default function Amm({ currentAccount, setCurrentAccount, avaxChain, setAvaxChain }) {

  const [fsl, setFsl] = useState(null)
  const [psl, setPsl] = useState(null)
  const [supply, setSupply] = useState(1000)
  const [lastFloorRaise, setLastFloorRaise] = useState(null)
  const [targetRatio, setTargetRatio] = useState(null)
  const [buy, setBuy] = useState('')
  const [sell, setSell] = useState('')
  const [redeem, setRedeem] = useState('')
  const [purchasePrice, setPurchasePrice] = useState(0)
  const [locksPercentChange, setLocksPercentChange] = useState(0)
  const [buyToggle, setBuyToggle] = useState(true)
  const [sellToggle, setSellToggle] = useState(false)
  const [redeemToggle, setRedeemToggle] = useState(false)

  useEffect(() => {
    // getContractData()
  }, [])

  useEffect(() => {
    simulateBuy()
  }, [buy])

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
    console.log('hello')
    if(action === 1) {
      setBuyToggle(true)
      setSellToggle(false)
      setRedeemToggle(false)
    }
    if(action === 2) {
      setBuyToggle(false)
      setSellToggle(true)
      setRedeemToggle(false)
    }
    if(action === 3) {
      setBuyToggle(false)
      setSellToggle(false)
      setRedeemToggle(true)
    }
  }

  function simulateBuy() {
    let _fsl = fsl
    let _psl = psl
    let _supply = supply
    let _purchasePrice = 0
    let startingFloor = _fsl / _supply
    for(let i = 0; i < buy; i++) {
      _supply++
      _purchasePrice += marketPrice(_fsl, _psl, _supply)
      if (_psl / _fsl >= 0.36) {
        _fsl += marketPrice(_fsl, _psl, _supply)
      }
      else {
        _fsl += floorPrice(_fsl, _supply)
        _psl += marketPrice(_fsl, _psl, _supply) - floorPrice(_fsl, _supply)
      }
    }
    setPurchasePrice(_purchasePrice / Math.pow(10, 18))
    setLocksPercentChange(((startingFloor - (_fsl / _supply)) / startingFloor) * 100)
  }

  function floorPrice(_fsl, _supply) {
    return _fsl / _supply
  }

  function marketPrice(_fsl, _psl, _supply) {
    return floorPrice(_fsl, _supply) + ((_psl / _supply) * ((_psl + _fsl) / _fsl)**5)
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
  //           <button className="px-12 py-3 w-36 bg-slate-100 hover:bg-slate-500 rounded-xl" onClick={() => buyFunctionInteraction}>buy</button>
  //           <input type="number" value={buy} id="input" className="w-24 pl-3 rounded" onChange={(e) => setBuy(e.target.value)}/>
  //         </div>
  //         <div className="flex justify-around flex-row items-center mt-8">
  //           <button className="px-12 py-3 w-36 bg-slate-100 hover:bg-slate-500 rounded-xl" onClick={() => sellFunctionInteraction}>sell</button>
  //           <input type="number" value={sell} id="input" className="w-24 pl-3 rounded" onChange={(e) => setSell(e.target.value)}/>
  //         </div>
  //         <div className="flex justify-around flex-row items-center mt-8">
  //           <button className="px-12 py-3 w-36 bg-slate-100 hover:bg-slate-500 rounded-xl" onClick={() => redeemFunctionInteraction}>redeem</button>
  //           <input type="number" value={redeem} id="input" className="w-24 pl-3 rounded" onChange={(e) => setRedeem(e.target.value)}/>
  //         </div>
  //       </div>
  //     )
  //   }
  // }

  return (
    <div className="flex flex-row py-3">
      <div className="w-[57%] flex flex-col py-8 px-24 rounded-xl bg-slate-100 ml-24 mt-12 h-[700px] border-2 border-black">
        <h1 className="text-[50px] font-acme text-[#ffff00]" id="text-outline">goldilocks AMM</h1>
        <div className="flex flex-row ml-2 items-center justify-between">
          <h3 className="font-acme text-[20px]">trading between $honey & $locks</h3>
          <div className="flex flex-row bg-white rounded-2xl border-2 border-black">
            <div className={`font-acme w-20 py-2 ${buyToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black`} onClick={() => handlePill(1)}>buy</div>
            <div className={`font-acme w-20 py-2 ${sellToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center border-r-2 border-black`} onClick={() => handlePill(2)}>sell</div>
            <div className={`font-acme w-20 py-2 ${redeemToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-r-2xl text-center`} onClick={() => handlePill(3)}>redeem</div>
          </div>
        </div>
        <div className="h-[75%] border-t-2 border-black mt-4">

        </div>
        <div className="flex flex-row border-t-2 border-black justify-between">
          <div>
            <div className="flex justify-around flex-row items-center mt-4">
              <p>fsl</p>
              <p>{ fsl && numFor.format((fsl / Math.pow(10, 18))) }</p>
            </div>
            <div className="flex justify-around flex-row items-center mt-4">
              <p>psl</p>
              <p>{ psl && numFor.format((psl / Math.pow(10, 18))) }</p>
            </div>
            <div className="flex justify-around flex-row items-center mt-4">
              <p>last floor raise</p>
              <p></p>
            </div>
          </div>
          <div>
            <div className="flex justify-around flex-row items-center mt-4">
              <p>target ratio</p>
              <p>{ targetRatio && (targetRatio / 10**16)+"%" }</p>
            </div>
            <div className="flex justify-around flex-row items-center mt-4">
              <p>purchase price</p>
              <p>{ purchasePrice > 0 && purchasePrice }</p>
            </div>
            <div className="flex justify-around flex-row items-center mt-4">
              <p>locks % change</p>
              <p>{ locksPercentChange > 0 && locksPercentChange.toFixed(2) + "%" }</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[30%]">
        <img className="h-[70%] w-[36%] absolute bottom-0 right-0" src={coolWithBear} />
      </div>
    </div>
  )
}