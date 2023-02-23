import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useSpring, config, animated } from "@react-spring/web"
import Bear from "./components/Bear"
import ammABI from "./abi/AMM.json"
import testhoneyABI from "./abi/TestHoney.json"
import { useAccount } from "wagmi"

export default function Amm({ currentAccount, setCurrentAccount, avaxChain, setAvaxChain }) {

  const [fsl, setFsl] = useState(null)
  const [newFsl, setNewFsl] = useState(null)
  const [psl, setPsl] = useState(null)
  const [newPsl, setNewPsl] = useState(null)
  const [supply, setSupply] = useState(null)
  const [newSupply, setNewSupply] = useState(null)
  const [lastFloorRaise, setLastFloorRaise] = useState(null)
  const [targetRatio, setTargetRatio] = useState(null)
  const [buy, setBuy] = useState(null)
  const [sell, setSell] = useState(null)
  const [redeem, setRedeem] = useState(null)
  const [allowance, setAllowance] = useState(null)
  const [buyToggle, setBuyToggle] = useState(true)
  const [sellToggle, setSellToggle] = useState(false)
  const [redeemToggle, setRedeemToggle] = useState(false)
  const [newFloor, setNewFloor] = useState(null)
  const [cost, setCost] = useState(null)
  const [receive, setReceive] = useState(null)
  const [redeemReceive, setRedeemReceive] = useState(null)

  useEffect(() => {
    getContractData()
  }, [])

  const account = useAccount()
  console.log(account.address)

  useEffect(() => {
    if(buy < 100000) {
      simulateBuy()
    }
    else {
      setNewFloor(fsl / supply)
      setNewFsl(fsl)
      setNewPsl(psl)
      setNewSupply(supply)
      setCost(0)
    }
  }, [buy])

  useEffect(() => {
    if(sell < supply) {
      simulateSell()
    }
    else {
      setNewFloor(fsl / supply)
      setNewFsl(fsl)
      setNewPsl(psl)
      setNewSupply(supply)
      setReceive(0)
    }
  }, [sell])

  useEffect(() => {
    if(redeem < supply) {
      simulateRedeem()
    }
    else {
      setNewFloor(fsl / supply)
      setNewFsl(fsl)
      setNewSupply(supply)
      setRedeemReceive(0)
    }
  }, [redeem])

  const springs = useSpring({
    from: { x: -900 },
    to: { x: 0 },
  })

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

  const ammAddy = '0x1b5F6509B8b4Dd5c9637C8fa6a120579bE33666F'
  const testhoneyAddy = '0x29b9439E09d1D581892686D9e00E3481DCDD5f78'

  function handlePill(action) {
    setBuy('')
    setSell('')
    setRedeem('')
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

  function handleNewFloorColor() {
    if(newFloor) {
      if(newFloor > floor) {
        return "text-green-600"
      }
      else {
        return "text-red-600"
      }
    }
    else {
      return "text-white"
    }
  }

  function simulateBuy() {
    let _fsl = fsl
    let _psl = psl
    let _supply = supply
    let _purchasePrice = 0
    let _tax = 0
    for(let i = 0; i < buy; i++) {
      _purchasePrice += marketPrice(_fsl, _psl, _supply)
      _supply++
      if (_psl / _fsl >= 0.50) {
        _fsl += marketPrice(_fsl, _psl, _supply)
      }
      else {
        _fsl += floorPrice(_fsl, _supply)
        _psl += marketPrice(_fsl, _psl, _supply) - floorPrice(_fsl, _supply)
      }
    }
    _tax = _purchasePrice * 0.003
    setNewFloor(floorPrice(_fsl + _tax, _supply))
    setNewFsl(_fsl + _tax)
    setNewPsl(_psl)
    setNewSupply(_supply)
    setCost(_purchasePrice + _tax)
  }

  function simulateSell() {
    let _fsl = fsl
    let _psl = psl
    let _supply = supply
    let _salePrice = 0
    for(let i = 0; i < sell; i++) {
      _supply--
      _salePrice += marketPrice(_fsl, _psl, _supply)
      _fsl -= floorPrice(_fsl, _supply)
      _psl -= marketPrice(_fsl, _psl, _supply) - floorPrice(_fsl, _supply)
    }
    setNewFloor(floorPrice(_fsl, _supply))
    setNewFsl(_fsl)
    setNewPsl(_psl)
    setNewSupply(_supply)
    setReceive(_salePrice)
  }

  function simulateRedeem() {
    setRedeemReceive(floorPrice(fsl, supply) * redeem)
    setNewFloor(floorPrice(fsl, supply))
    setNewFsl(fsl - (floorPrice(fsl, supply) * redeem))
    setNewSupply(supply - redeem)
  }

  function floorPrice(_fsl, _supply) {
    return _fsl / _supply
  }

  function marketPrice(_fsl, _psl, _supply) {
    return floorPrice(_fsl, _supply) + ((_psl / _supply) * ((_psl + _fsl) / _fsl)**5)
  }

  function handleTopLabel() {
    if(buyToggle) {
      return 'buy'
    }
    if(sellToggle) {
      return 'sell'
    }
    if(redeemToggle) {
      return 'redeem'
    }
  }

  function handleBottomLabel() {
    if(buyToggle) {
      return 'cost'
    }
    if(sellToggle) {
      return 'receive'
    }
    if(redeemToggle) {
      return 'receive'
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
      if(buyToggle) {
        if(allowance >= cost) {
          return 'buy'
        }
        else {
          return 'approve'
        }
      }
      if(sellToggle) {
        return 'sell'
      }
      if(redeemToggle) {
        return 'redeem'
      }
    }
  }

  async function handleButtonClick() {
    if(!currentAccount) {
      connectWallet()
    }
    else if(!avaxChain) {
      switchToFuji()
    }
    else {
      if(buyToggle) {
        if(allowance >= cost) {
          buyFunctionInteraction()
        }
        else {
          const allowanceReq = await checkHoneyAllowance()
          if(allowanceReq >= cost) {
            return
          }
          else {
            approveHoneyInteraction()
          }
        }
      }
      if(sellToggle) {
        sellFunctionInteraction()
      }
      if(redeemToggle) {
        redeemFunctionInteraction()
      }
    }
  }

  function handleTopChange(e) {
    if(buyToggle) {
      setBuy(e)
    }
    if(sellToggle) {
      setSell(e)
    }
    if(redeemToggle) {
      setRedeem(e)
    }
  }

  function handleTopInput() {
    if(buyToggle) {
      return buy > 99999 ? '' : buy
    }
    if(sellToggle) {
      return sell > supply ? '' : sell
    }
    if(redeemToggle) {
      return redeem > supply ? '' : redeem
    }
  }

  function handleBottomInput() {
    if(buyToggle) {
      if(!cost) {
        return 0
      }
      else {
        return numFor.format(cost)
      }
    }
    if(sellToggle) {
      if(!receive) {
        return 0
      }
      else {
        return numFor.format(receive)
      }
    }
    if(redeemToggle) {
      if(!redeemReceive) {
        return 0
      }
      else {
        return numFor.format(redeemReceive)
      }
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
    const ammContractObject = new ethers.Contract(ammAddy, ammABI.abi, provider)
    const fslReq = await ammContractObject.fsl()
    const pslReq = await ammContractObject.psl()
    const supplyReq = await ammContractObject.supply()
    const floorReq = await ammContractObject.lastFloorRaise()
    const ratioReq = await ammContractObject.targetRatio()
    if(currentAccount) {
      checkHoneyAllowance()
    }
    setFsl(parseInt(fslReq._hex, 16) / Math.pow(10, 18))
    setPsl(parseInt(pslReq._hex, 16) / Math.pow(10, 18))
    setSupply(parseInt(supplyReq._hex, 16) / Math.pow(10, 18))
    setNewFsl(parseInt(fslReq._hex, 16) / Math.pow(10, 18))
    setNewPsl(parseInt(pslReq._hex, 16) / Math.pow(10, 18))
    setNewFloor(parseInt((fslReq._hex, 16) / Math.pow(10, 18)) / supply)
    setLastFloorRaise(new Date(parseInt(floorReq._hex, 16)).toLocaleString())
    setTargetRatio(parseInt(ratioReq._hex, 16))
  }

  async function checkHoneyAllowance() {
    const provider = new ethers.providers.JsonRpcProvider(quickNodeFuji.rpcUrls[0])
    const testhoneyContractObject = new ethers.Contract(testhoneyAddy, testhoneyABI.abi, provider)
    const allowanceReq = await testhoneyContractObject.allowance(currentAccount, ammAddy)
    setAllowance(parseInt(allowanceReq._hex, 16) / Math.pow(10, 18))
    return parseInt(allowanceReq._hex, 16) / Math.pow(10, 18)
  }

  async function buyFunctionInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const ammContractObjectSigner = new ethers.Contract(ammAddy, ammABI.abi, signer)
    const buyTx = await ammContractObjectSigner.buy(ethers.utils.parseUnits(buy, 18), ethers.utils.parseUnits("100000000", 18))
    buyTx.wait()
  }

  async function sellFunctionInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const ammContractObjectSigner = new ethers.Contract(ammAddy, ammABI.abi, signer)
    const sellTx = await ammContractObjectSigner.sell(ethers.utils.parseUnits(sell, 18))
    sellTx.wait()
  }

  async function redeemFunctionInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const ammContractObjectSigner = new ethers.Contract(ammAddy, ammABI.abi, signer)
    const redeemTx = await ammContractObjectSigner.redeem(ethers.utils.parseUnits(redeem, 18))
    redeemTx.wait()
  }

  async function approveHoneyInteraction() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const testhoneyContractObject = new ethers.Contract(testhoneyAddy, testhoneyABI.abi, signer)
    const approveTx = await testhoneyContractObject.approve(ammAddy, ethers.utils.parseUnits(cost.toString(), 18))
    approveTx.wait()
  }

  return (
    <div className="flex flex-row py-3 overflow-hidden">
      <animated.div className="w-[57%] flex flex-col pt-8 pb-2 px-24 rounded-xl bg-slate-300 ml-24 mt-12 h-[700px] border-2 border-black" style={springs}>
        <h1 className="text-[50px] font-acme text-[#ffff00]" id="text-outline">goldilocks AMM</h1>
        <div className="flex flex-row ml-2 items-center justify-between">
          <h3 className="font-acme text-[24px] ml-2">trading between $honey & $locks</h3>
          <div className="flex flex-row bg-white rounded-2xl border-2 border-black">
            <div className={`font-acme w-20 py-2 ${buyToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(1)}>buy</div>
            <div className={`font-acme w-20 py-2 ${sellToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(2)}>sell</div>
            <div className={`font-acme w-20 py-2 ${redeemToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-r-2xl text-center cursor-pointer`} onClick={() => handlePill(3)}>redeem</div>
          </div>
        </div>
        <div className="h-[75%] relative mt-4 flex flex-col">
          <div className="h-[67%] px-6">
            <div className="rounded-3xl border-2 border-black mt-2 h-[50%] bg-white flex flex-col">
              <div className="h-[50%]">
                <h1 className="font-acme text-[30px] px-6 my-2">{handleTopLabel()}</h1>
              </div>
              <div className="h-[50%] pl-10">
                <input className="border-none focus:outline-none font-acme rounded-xl text-[40px]" placeholder="0" value={handleTopInput()} onChange={(e) => handleTopChange(e.target.value)} type="number" id="number-input" autoFocus />
              </div>
            </div>
            <div className="absolute top-[31%] left-[50%] h-10 w-10 bg-[#ffff00] border-2 border-black rounded-3xl flex justify-center items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D111C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
            </div>
            <div className="rounded-3xl border-2 border-black mt-2 h-[50%] bg-white flex flex-col">
              <div className="h-[50%]">
                <h1 className="font-acme text-[30px] px-6 my-2">{handleBottomLabel()}</h1>
              </div>
              <div className="h-[50%] pl-10">
                <h1 className="font-acme text-[40px]">{handleBottomInput()}</h1>
              </div>
            </div>
          </div>
          <div className="h-[33%] w-[100%] flex justify-center items-center">
            <button className="h-[50%] w-[50%] bg-white rounded-xl py-3 px-6 border-2 border-black font-acme text-[30px]" id="amm-button" onClick={() => handleButtonClick()} >{renderButton()}</button>
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <div className="flex flex-row w-[55%] px-3 ml-3 justify-between rounded-xl border-2 border-black mt-2  bg-white">
            <div className="flex flex-col items-start justify-between">
              <h1 className="font-acme text-[24px]">$LOCKS floor price:</h1>
              <p className="font-acme text-[24px]">current fsl:</p>
              <p className="font-acme text-[24px]">current psl:</p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <p className="font-acme text-[24px]">${ numFor.format(fsl / supply) }</p>
              <p className="font-acme text-[20px]">{ fsl && numFor.format(fsl) }</p>
              <p className="font-acme text-[20px]">{ psl && numFor.format(psl) }</p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <p className={`font-acme text-[24px]`}>${ numFor.format(newFloor) }</p>
              <p className="font-acme text-[20px]">{ numFor.format(newFsl) }</p>
              <p className="font-acme text-[20px]">{ numFor.format(newPsl) }</p>
            </div>
          </div>
          <div className="flex flex-row w-[40%] px-3 justify-between mr-3 rounded-xl border-2 border-black mt-2 bg-white">
            <div className="flex flex-col items-start justify-between w-[40%]">
              <h1 className="font-acme text-[20px]">$LOCKS supply:</h1>
              <p className="font-acme text-[20px]">target ratio:</p>
              <p className="font-acme text-[20px]">last floor raise:</p>
            </div>
            <div className="flex flex-col items-center justify-between w-[30%]">
              <p className="font-acme text-[20px]">{supply && supply}</p>
              <p className="font-acme text-[20px]">{ targetRatio && (targetRatio / 10**16)+"%" }</p>
              <p className="font-acme text-[20px] text-white">1,044</p>
            </div>
            <div className="flex flex-col items-end justify-between w-[30%]">
              <p className="font-acme text-[20px]">{newSupply && numFor.format(newSupply)}</p>
              <p className="font-acme text-[20px] text-white">1,044</p>
              <span className="font-acme text-[20px] whitespace-nowrap">{lastFloorRaise}</span>
            </div>
          </div>
        </div>
      </animated.div>
      <Bear />
    </div>
  )
}