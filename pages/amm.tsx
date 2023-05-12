import React, { useEffect, useState } from "react"
import Head from "next/head"
import { useSpring, animated } from "@react-spring/web"
import { 
  useFormatDate,
  useLabel
} from "../hooks/amm"
import { 
  useNotification,
  useWallet,
  useInfo,
  useTx
} from "../providers"
import { contracts } from "../utils"
import Bear from "../components/Bear"
import LeftAmmBoxText from "../components/LeftAmmBoxText"
import RightAmmBoxText from "../components/RightAmmBoxText"
import LeftAmmBoxCurNums from "../components/LeftAmmBoxCurNums"
import RightAmmBoxCurNums from "../components/RightAmmBoxCurNums"

export default function Amm() {

  const [displayString, setDisplayString] = useState<string>('')
  
  const [newFsl, setNewFsl] = useState<number>(0)
  const [newPsl, setNewPsl] = useState<number>(0)
  const [newFloor, setNewFloor] = useState<number>(0)
  const [newMarket, setNewMarket] = useState<number>(0)
  const [newSupply, setNewSupply] = useState<number>(0)

  const [buy, setBuy] = useState<number>(0)
  const [sell, setSell] = useState<number>(0)
  const [redeem, setRedeem] = useState<number>(0)
  
  const [buyToggle, setBuyToggle] = useState<boolean>(true)
  const [sellToggle, setSellToggle] = useState<boolean>(false)
  const [redeemToggle, setRedeemToggle] = useState<boolean>(false)
  
  const [cost, setCost] = useState<number>(0)
  const [receive, setReceive] = useState<number>(0)
  const [redeemReceive, setRedeemReceive] = useState<number>(0)

  const { openNotification } = useNotification()
  const { balance, wallet, isConnected, signer, network, getBalances, refreshBalances } = useWallet()
  const { ammInfo, getAmmInfo, refreshAmmInfo } = useInfo()
  const { checkAllowance, sendApproveTx, sendBuyTx, sendSellTx, sendRedeemTx } = useTx()

  const formatAsPercentage = Intl.NumberFormat('default', {
    style: 'percent',
    maximumFractionDigits: 2
  })
  
  const springs = useSpring({
    from: { x: -900 },
    to: { x: 0 },
  })

  async function test() {
    console.log(ammInfo.psl)
    console.log(newPsl)
  }

  const fetchBalances = async () => {
    await getBalances()
  }

  const fetchInfo = async () => {
    const data = await getAmmInfo()
    setNewFsl(data.fsl)
    setNewPsl(data.psl)
    setNewFloor(floorPrice(data.fsl, data.supply))
    setNewMarket(marketPrice(data.fsl, data.psl, data.supply))
    setNewSupply(data.supply)
  }

  const refreshInfo = async (signer: any) => {
    const data = await refreshAmmInfo(signer)
    setNewFsl(data.fsl)
    setNewPsl(data.psl)
    setNewFloor(floorPrice(data.fsl, data.supply))
    setNewMarket(marketPrice(data.fsl, data.psl, data.supply))
    setNewSupply(data.supply)
  }

  useEffect(() => {
    fetchBalances()
    fetchInfo()
  }, [isConnected])

  useEffect(() => {
    if(buy < 999) {
      simulateBuy()
    }
    else {
      setNewFloor(ammInfo.fsl / ammInfo.supply)
      setNewFsl(ammInfo.fsl)
      setNewPsl(ammInfo.psl)
      setNewSupply(ammInfo.supply)
      setCost(0)
    }
  }, [buy])

  useEffect(() => {
    if(sell <= ammInfo.supply) {
      simulateSell()
    }
    else {
      setNewFloor(ammInfo.fsl / ammInfo.supply)
      setNewFsl(ammInfo.fsl)
      setNewPsl(ammInfo.psl)
      setNewSupply(ammInfo.supply)
      setReceive(0)
    }
  }, [sell])

  useEffect(() => {
    if(redeem <= ammInfo.supply) {
      simulateRedeem()
    }
    else {
      setNewFloor(ammInfo.fsl / ammInfo.supply)
      setNewFsl(ammInfo.fsl)
      setNewSupply(ammInfo.supply)
      setRedeemReceive(0)
    }
  }, [redeem])
  
  function simulateBuy() {
    let _leftover = buy
    let _fsl = ammInfo.fsl
    let _psl = ammInfo.psl
    let _supply = ammInfo.supply
    let _purchasePrice = 0
    let _tax = 0
    let _market = 0
    let _floor = 0
    while(_leftover >= 1) {
      _market = marketPrice(_fsl, _psl, _supply)
      _floor = floorPrice(_fsl, _supply)
      _purchasePrice += _market
      _supply++
      if(_psl / _fsl >= 0.50) {
        _fsl += _market
      }
      else {
        _fsl += _floor
        _psl += (_market - _floor)
      }
      _leftover--
    }
    if(_leftover > 0) {
      _market = marketPrice(_fsl, _psl, _supply)
      _floor = floorPrice(_fsl, _supply)
      _purchasePrice += _market * _leftover
      _supply += _leftover
      if(_psl / _fsl >= 0.50) {
        _fsl += _market * _leftover
      }
      else {
        _psl += (_market - _floor) * _leftover
        _fsl += _floor * _leftover
      }
    }
    _tax = _purchasePrice * 0.003
    setNewFloor(floorPrice(_fsl + _tax, _supply))
    setNewMarket(marketPrice(_fsl + _tax, _psl, _supply))
    setNewFsl(_fsl + _tax)
    setNewPsl(_psl)
    setNewSupply(_supply)
    setCost(_purchasePrice + _tax)
    simulateFloorRaise(_fsl + _tax, _psl, _supply)
  }
  
  function simulateSell() {
    let _leftover = sell
    let _fsl = ammInfo.fsl
    let _psl = ammInfo.psl
    let _supply = ammInfo.supply
    let _salePrice = 0
    let _tax = 0
    let _market = 0
    let _floor = 0
    while(_leftover >= 1) {
      _market = marketPrice(_fsl, _psl, _supply)
      _floor = floorPrice(_fsl, _supply) 
      _salePrice += _market
      _supply--
      _leftover--
      _fsl -= _floor
      _psl -= (_market - _floor)
    }
    if(_leftover > 0) {
      _market = marketPrice(_fsl, _psl, _supply)
      _floor = floorPrice(_fsl, _supply)
      _salePrice += _market * _leftover
      _psl -= (_market - _floor) * _leftover
      _fsl -= _floor * _leftover
      _supply -= _leftover
    }
    _tax = _salePrice * 0.053
    setNewFloor(floorPrice(_fsl + _tax, _supply))
    setNewMarket(marketPrice(_fsl + _tax, _psl, _supply))
    setNewFsl(_fsl + _tax)
    setNewPsl(_psl)
    setNewSupply(_supply)
    setReceive(_salePrice - _tax)
  }
  
  function simulateRedeem() {
    let rawTotal: number = redeem * floorPrice(ammInfo.fsl, ammInfo.supply)
    setRedeemReceive(rawTotal)
    setNewFsl(ammInfo.fsl - rawTotal)
    setNewSupply(ammInfo.supply - redeem)
    setNewFloor(floorPrice(ammInfo.fsl - rawTotal, ammInfo.supply - redeem))
    setNewMarket(marketPrice(ammInfo.fsl - rawTotal, ammInfo.psl, ammInfo.supply - redeem))
    simulateFloorRaise(ammInfo.fsl - rawTotal, ammInfo.psl, ammInfo.supply - redeem)
  }

  function simulateFloorRaise(_fsl: number, _psl: number, _supply: number) {
    if(_psl / _fsl >= ammInfo.targetRatio) {
      let raiseAmount: number = (_psl / _fsl) * (_psl / 32)
      setNewFsl((prev) => {
        setNewFloor(floorPrice(prev + raiseAmount, _supply))
        return prev + raiseAmount
      })
      setNewPsl((prev) => {
        setNewMarket(marketPrice(prev + raiseAmount, prev - raiseAmount, _supply))
        return prev - raiseAmount
      })
    }
  }
  
  function floorPrice(_fsl: number, _supply: number) {
    return _fsl / _supply
  }
  
  function marketPrice(_fsl: number, _psl: number, _supply: number) {
    return floorPrice(_fsl, _supply) + ((_psl / _supply) * ((_psl + _fsl) / _fsl)**5)
  }

  function handlePill(action: number) {
    setDisplayString('')
    setBuy(0)
    setSell(0)
    setRedeem(0)
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
  
  function renderButton() {
    if(buyToggle) {
      if(cost > ammInfo.honeyAmmAllowance) {
        return 'approve use of $honey'
      }
      return 'buy'
    }
    if(sellToggle) {
      return 'sell'
    }
    if(redeemToggle) {
      return 'redeem'
    }
  }

  async function handleButtonClick() {
    const button = document.getElementById('amm-button')

    if(!isConnected) {
      button && (button.innerHTML = "connect wallet")
    }
    else if(network !== "Avalanche Fuji C-Chain") {
      button && (button.innerHTML = "switch to devnet plz")
    }
    else {
      if(buyToggle) {
        if(buy == 0) {
          return
        }
        const sufficientAllowance: boolean | void = await checkAllowance('honey', contracts.amm.address, cost, signer)
        if(sufficientAllowance) {
          button && (button.innerHTML = "buying...")
          const buyTx = await sendBuyTx(buy, cost, signer)
          buyTx && openNotification({
            title: 'Successfully Purchased $LOCKS!',
            hash: buyTx.hash,
            direction: 'bought',
            amount: buy,
            price: cost,
            page: 'amm'
          })
          button && (button.innerHTML = "buy")
          setBuy(0)
          setDisplayString('')
          refreshBalances(wallet, signer)
          refreshInfo(signer)
        }
        else {
          button && (button.innerHTML = "approving...")
          await sendApproveTx('honey', contracts.amm.address, cost , signer)
          setTimeout(() => {
            button && (button.innerHTML = "buy")
          }, 10000)
        }
      }
      if(sellToggle) {
        if(sell == 0) {
          return
        }
        button && (button.innerHTML = "selling...")
        const sellTx = await sendSellTx(sell, receive, signer)
        sellTx && openNotification({
          title: 'Successfully Sold $LOCKS!',
          hash: sellTx.hash,
          direction: 'sold',
          amount: sell,
          price: receive,
          page: 'amm'
        })
        button && (button.innerHTML = "sell")
        setSell(0)
        setDisplayString('')
        refreshBalances(wallet, signer)
        refreshInfo(signer)
      }
      if(redeemToggle) {
        if(redeem == 0) {
          return
        }
        button && (button.innerHTML = "redeeming...")
        const redeemTx = await sendRedeemTx(redeem, signer)
        redeemTx && openNotification({
          title: 'Successfully Redeemed $LOCKS!',
          hash: redeemTx.hash,
          direction: 'redeemed',
          amount: redeem,
          price: redeem * (ammInfo.fsl / ammInfo.supply),
          page: 'amm'
        })
        button && (button.innerHTML = "redeem")
        setRedeem(0)
        setDisplayString('')
        refreshBalances(wallet, signer)
        refreshInfo(signer)
      }
    }
  }

  function handlePercentageButtons(action: number) {
    if(action == 1) {
      if(buyToggle) {
        setDisplayString((balance.honey / 4).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setBuy(balance.honey / 4)
      }
      if(sellToggle) {
        setDisplayString((balance.locks / 4).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setSell(balance.locks / 4)        
      }
      if(redeemToggle) {
        setDisplayString((balance.locks / 4).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setRedeem(balance.locks / 4)
      }
    }
    if(action == 2) {
      if(buyToggle) {
        setDisplayString((balance.honey / 2).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setBuy(balance.honey / 2)
      }
      if(sellToggle) {
        setDisplayString((balance.locks / 2).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setSell(balance.locks / 2)
      }
      if(redeemToggle) {
        setDisplayString((balance.locks / 2).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setRedeem(balance.locks / 2)
      }
    }
    if(action == 3) {

      if(buyToggle) {
        setDisplayString((balance.honey * 0.75).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setBuy(balance.honey * 0.75)
      }
      if(sellToggle) {
        setDisplayString((balance.locks * 0.75).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setSell(balance.locks * 0.75)
      }
      if(redeemToggle) {
        setDisplayString((balance.locks * 0.75).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setRedeem(balance.locks * 0.75)
      }
    }
    if(action == 4) {
      if(buyToggle) {
        setDisplayString((balance.honey).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setBuy(balance.honey > 999 ? 999 : balance.honey)
      }
      if(sellToggle) {
        setDisplayString((balance.locks).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setSell(balance.locks)
      }
      if(redeemToggle) {
        setDisplayString((balance.locks).toLocaleString('en-US', { maximumFractionDigits: 4 }))
        setRedeem(balance.locks)
      }
    }
  }
  
  function handleTopChange(input: string) {
    setDisplayString(input)
    if(buyToggle) {
      if(!input) {
        setBuy(0)
      }
      else {
        setBuy(parseFloat(input))
      }
    }
    if(sellToggle) {
      if(!input) {
        setSell(0)
      }
      else {
        setSell(parseFloat(input))
      }
    }
    if(redeemToggle) {
      if(!input) {
        setRedeem(0)
      }
      else {
        setRedeem(parseFloat(input))
      }
    }
  }
  
  function handleTopInput() {
    if(buyToggle) {
      return parseFloat(displayString) >= 999 ? '' : displayString
    }
    if(sellToggle) {
      return parseFloat(displayString) >= ammInfo.supply ? '' : displayString
    }
    if(redeemToggle) {
      return parseFloat(displayString) >= ammInfo.supply ? '' : displayString
    }
  }

  function handleBottomInput() {
    if(buyToggle) {
      if(!cost) {
        return "0.00"
      }
      else {
        return cost.toLocaleString('en-US', { maximumFractionDigits: 2 })
      }
    }
    if(sellToggle) {
      if(!receive) {
        return "0.00"
      }
      else {
        return receive.toLocaleString('en-US', { maximumFractionDigits: 2 })
      }
    }
    if(redeemToggle) {
      if(!redeemReceive) {
        return "0.00"
      }
      else {
        return redeemReceive.toLocaleString('en-US', { maximumFractionDigits: 2 })
      }
    }
  }

  function handleTopBalance() {
    if(buyToggle) {
      return balance.locks > 0 ? balance.locks.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
    }
    if(sellToggle) {
      return balance.locks > 0 ? balance.locks.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
    }
    if(redeemToggle) {
      return balance.locks > 0 ? balance.locks.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
    }
  }

  function handleBottomBalance() {
    if(buyToggle) {
      return balance.honey > 0 ? balance.honey.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
    }
    if(sellToggle) {
      return balance.honey > 0 ? balance.honey.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
    }
    if(redeemToggle) {
      return balance.honey > 0 ? balance.honey.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
    }
  }
  
  return (
    <>
      <Head>
        <title>mf amm</title>
      </Head>
      <div className="flex flex-row py-3 overflow-hidden">
        <animated.div className="w-[57%] flex flex-col pt-8 pb-2 px-24 rounded-xl bg-slate-300 ml-24 mt-12 h-[95%] border-2 border-black" style={springs}>
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
                <div className="h-[50%] flex flex-row items-center justify-between">
                  <div className="flex flex-row mt-3">
                    <h1 className="font-acme text-[30px] pl-10 pr-5 mt-2">{useLabel(buyToggle, sellToggle, redeemToggle, "topLabel")}</h1>
                    <div className="rounded-[50px] p-2 flex flex-row bg-slate-100 border-2 border-black items-center">{useLabel(buyToggle, sellToggle, redeemToggle, "topToken")}</div>
                  </div>
                  <div className="flex flex-row items-center mr-10">
                    <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(1)}>25%</button>
                    <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(2)}>50%</button>
                    <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(3)}>75%</button>
                    <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(4)}>MAX</button>
                  </div>
                </div>
                <div className="h-[50%] pl-10 flex flex-row items-center justify-between">
                  <input className="border-none focus:outline-none bg-transparent font-acme rounded-xl text-[40px]" placeholder="0.00" value={handleTopInput()} onChange={(e) => handleTopChange(e.target.value)} type="number" id="number-input" autoFocus />
                  <h1 className="mr-10 mt-4 text-[23px] font-acme text-[#878d97]">balance: {handleTopBalance()}</h1>
                </div>
              </div>
              <div className="absolute top-[31%] left-[50%] h-10 w-10 bg-[#ffff00] border-2 border-black rounded-3xl flex justify-center items-center" onClick={() => test()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D111C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
              </div>
              <div className="rounded-3xl border-2 border-black mt-2 h-[50%] bg-white flex flex-col">
                <div className="h-[50%] flex flex-row items-center">
                  <h1 className="font-acme text-[30px] ml-10 pr-5 mt-3">{useLabel(buyToggle, sellToggle, redeemToggle, "bottomLabel")}</h1>
                  <div className="rounded-[50px] mt-3 p-2 flex flex-row bg-slate-100 border-2 border-black items-center">{useLabel(buyToggle, sellToggle, redeemToggle, "bottomToken")}</div>
                </div>
                <div className="h-[50%] pl-10 flex flex-row items-center justify-between">
                  <h1 className={`${buyToggle && !cost || sellToggle && !receive || redeemToggle && !redeemReceive ? "text-[#9ca3af]" : ""} font-acme text-[40px]`}>{handleBottomInput()}</h1>
                  <h1 className="mr-10 mt-4 text-[23px] font-acme text-[#878d97]">balance: {handleBottomBalance()}</h1>
                </div>
              </div>
            </div>
            <div className="h-[33%] w-[100%] flex justify-center items-center">
              <button className="h-[50%] w-[50%] bg-white rounded-xl mt-5 py-3 px-6 border-2 border-black font-acme text-[30px]" id="amm-button" onClick={() => handleButtonClick()} >{renderButton()}</button>
            </div>
          </div>
          <div className="flex flex-row justify-between">
            <div className="flex flex-row w-[55%] px-3 ml-3 justify-between rounded-xl border-2 border-black mt-2 bg-white">
              <LeftAmmBoxText />
              <LeftAmmBoxCurNums floor={floorPrice(ammInfo.fsl, ammInfo.supply)} market={marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply)} fsl={ammInfo.fsl} psl={ammInfo.psl} />
              <div className="flex flex-col items-end justify-between">
                <p className={`${floorPrice(ammInfo.fsl, ammInfo.supply) > newFloor ? "text-red-600" : floorPrice(ammInfo.fsl, ammInfo.supply) == newFloor ? "" : "text-green-600"} font-acme text-[20px]`}>${ buy > 0 || sell > 0 || redeem > 0 ? newFloor.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}</p>
                <p className={`${marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply) > newMarket ? "text-red-600" : marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply) == newMarket ? "" : "text-green-600"} font-acme text-[20px]`}>${ buy > 0 || sell > 0 || redeem > 0 ? newMarket.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}</p>
                <p className={`${ammInfo.fsl > newFsl ? "text-red-600" : ammInfo.fsl == newFsl ? "" : "text-green-600"} font-acme text-[20px]`}>{ ammInfo.fsl == newFsl ? "-" : newFsl.toLocaleString('en-US', { maximumFractionDigits: 2 }) }</p>
                <p className={`${ammInfo.psl > newPsl ? "text-red-600" : ammInfo.psl == newPsl ? "" : "text-green-600"} font-acme text-[20px]`}>{ buy > 0 || sell > 0 || redeem > 0 ? newPsl.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}</p>
              </div>
            </div>
            <div className="flex flex-row w-[40%] px-3 justify-between mr-3 rounded-xl border-2 border-black mt-2 bg-white">
              <RightAmmBoxText />
              <RightAmmBoxCurNums supply={ammInfo.supply} />
              <div className="flex flex-col items-end justify-between w-[30%]">
                <p className={`${ammInfo.supply > newSupply ? "text-red-600" : ammInfo.supply == newSupply ? "" : "text-green-600"} font-acme text-[20px]`}>{ ammInfo.supply == newSupply ? "-" : newSupply.toLocaleString('en-US', { maximumFractionDigits: 2 }) }</p>
                <p className="font-acme text-[20px]">{ ammInfo.targetRatio > 0 ? formatAsPercentage.format(ammInfo.targetRatio) : "-" }</p>
                <p className="font-acme text-[20px] whitespace-nowrap">{useFormatDate(ammInfo.lastFloorRaise * Math.pow(10, 21))}</p>
              </div>
            </div>
          </div>
        </animated.div>
        <Bear />
      </div>
    </>
  )
}