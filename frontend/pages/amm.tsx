import React, { useEffect, useState } from "react"
import Head from "next/head"
import { useSpring, animated } from "@react-spring/web"
import { 
  useFormatDate,
  useLabel,
  useDebounce,
  useGammMath
} from "../hooks/amm"
import { 
  useNotification,
  useWallet,
  useInfo,
  useTx
} from "../providers"
import { contracts } from "../utils/addressi"
import Bear from "../components/Bear"
import LeftAmmBoxText from "../components/LeftAmmBoxText"
import RightAmmBoxText from "../components/RightAmmBoxText"
import LeftAmmBoxCurNums from "../components/LeftAmmBoxCurNums"
import RightAmmBoxCurNums from "../components/RightAmmBoxCurNums"

export default function Amm() {

  const [displayString, setDisplayString] = useState<string>('')
  const [bottomDisplayString, setBottomDisplayString] = useState<string>('')
  const [slippageDisplayString, setSlippageDisplayString] = useState<string>('0.1')
  
  const [newFsl, setNewFsl] = useState<number>(0)
  const [newPsl, setNewPsl] = useState<number>(0)
  const [newFloor, setNewFloor] = useState<number>(0)
  const [newMarket, setNewMarket] = useState<number>(0)
  const [newSupply, setNewSupply] = useState<number>(0)

  const [honeyBuy, setHoneyBuy] = useState<number>(0)
  const debouncedHoneyBuy = useDebounce(honeyBuy, 1000)
  const [sellingLocks, setSellingLocks] = useState<number>(0)
  const [slippage, setSlippage] = useState<number>(0.1)
  
  const [buyToggle, setBuyToggle] = useState<boolean>(true)
  const [sellToggle, setSellToggle] = useState<boolean>(false)
  const [redeemToggle, setRedeemToggle] = useState<boolean>(false)
  const [slippageToggle, setSlippageToggle] = useState<boolean>(false)
  const [popupToggle, setPopupToggle] = useState<boolean>(false)

  const [topInputFlag, setTopInputFlag] = useState<boolean>(false)
  const [bottomInputFlag, setBottomInputFlag] = useState<boolean>(false)
  
  const [buyingLocks, setBuyingLocks] = useState<number>(0)
  const [gettingHoney, setGettingHoney] = useState<number>(0)
  const debouncedGettingHoney = useDebounce(gettingHoney, 1000)
  const [redeemingLocks, setRedeemingLocks] = useState<number>(0)
  const [redeemingHoney, setRedeemingHoney] = useState<number>(0)

  const { floorPrice, marketPrice, simulateBuyDry, simulateSellDry } = useGammMath()
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
    console.log('gettingHoney: ', gettingHoney)
    console.log('bottomDisplayString: ', bottomDisplayString)
  }

  const fetchBalances = async () => {
    await getBalances()
  }

  const fetchInfo = async () => {
    const data = await getAmmInfo()
    if(data) {
      setNewFsl(data.fsl)
      setNewPsl(data.psl)
      setNewFloor(floorPrice(data.fsl, data.supply))
      setNewMarket(marketPrice(data.fsl, data.psl, data.supply))
      setNewSupply(data.supply)
    }
  }

  const refreshInfo = async (signer: any) => {
    const data = await refreshAmmInfo(signer)
    if(data) {
      setNewFsl(data.fsl)
      setNewPsl(data.psl)
      setNewFloor(floorPrice(data.fsl, data.supply))
      setNewMarket(marketPrice(data.fsl, data.psl, data.supply))
      setNewSupply(data.supply)
    }
  }

  useEffect(() => {
    fetchBalances()
    fetchInfo()
  }, [isConnected])

  useEffect(() => {
    if(!bottomInputFlag) {
      if(debouncedHoneyBuy <= balance.honey) {
        if(!debouncedHoneyBuy) {
          setNewFloor(ammInfo.fsl / ammInfo.supply)
          setNewMarket(marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply))
          setNewFsl(ammInfo.fsl)
          setNewPsl(ammInfo.psl)
          setNewSupply(ammInfo.supply)
          setBuyingLocks(0)
          setBottomDisplayString('')
        }
        else {
          setTopInputFlag(true)
          const locksAmount: number = findLocksBuyAmount(debouncedHoneyBuy)
          simulateBuy(locksAmount)
        }
      }
      else {
        setNewFloor(ammInfo.fsl / ammInfo.supply)
        setNewMarket(marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply))
        setNewFsl(ammInfo.fsl)
        setNewPsl(ammInfo.psl)
        setNewSupply(ammInfo.supply)
        setBuyingLocks(0)
        setBottomDisplayString('')
      }
    }
  }, [debouncedHoneyBuy])

  useEffect(() => {
    if(!topInputFlag) {
      const locksWithSlippage: number = buyingLocks * (1 + (slippage / 100))
      if(simulateBuyDry(locksWithSlippage, ammInfo.fsl, ammInfo.psl, ammInfo.supply) < balance.honey) {
        if(!buyingLocks) {
          setNewFloor(ammInfo.fsl / ammInfo.supply)
          setNewMarket(marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply))
          setNewFsl(ammInfo.fsl)
          setNewPsl(ammInfo.psl)
          setNewSupply(ammInfo.supply)
          setHoneyBuy(0)
          setDisplayString('')
        }
        else {
          setBottomInputFlag(true)
          !slippageToggle && setDisplayString(simulateBuyDry(locksWithSlippage, ammInfo.fsl, ammInfo.psl, ammInfo.supply).toFixed(4))
          !slippageToggle && setHoneyBuy(simulateBuyDry(locksWithSlippage, ammInfo.fsl, ammInfo.psl, ammInfo.supply))
          simulateBuy(locksWithSlippage)
        }
      }
      else {
        setNewFloor(ammInfo.fsl / ammInfo.supply)
        setNewMarket(marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply))
        setNewFsl(ammInfo.fsl)
        setNewPsl(ammInfo.psl)
        setNewSupply(ammInfo.supply)
        setHoneyBuy(0)
        setDisplayString('')
      }
    }
  }, [buyingLocks])
  
  useEffect(() => {
    if(buyToggle) {
      const locksAmount: number = findLocksBuyAmount(debouncedHoneyBuy)
      simulateBuy(locksAmount)
    }
    if(sellToggle) {
      setGettingHoney(simulateSellDry(sellingLocks, ammInfo.fsl, ammInfo.psl, ammInfo.supply) * (1 - (slippage / 100)))
      setBottomDisplayString((simulateSellDry(sellingLocks, ammInfo.fsl, ammInfo.psl, ammInfo.supply) * (1 - (slippage / 100))).toFixed(4))
    }
  }, [slippage])

  useEffect(() => {
    if(!bottomInputFlag) {
      if(sellingLocks <= balance.locks) {
        if(!sellingLocks) {
          setNewFloor(ammInfo.fsl / ammInfo.supply)
          setNewMarket(marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply))
          setNewFsl(ammInfo.fsl)
          setNewPsl(ammInfo.psl)
          setNewSupply(ammInfo.supply)
          setGettingHoney(0)
          setBottomDisplayString('')
        }
        else {
          setTopInputFlag(true)
          simulateSell(sellingLocks)
          setGettingHoney(simulateSellDry(sellingLocks, ammInfo.fsl, ammInfo.psl, ammInfo.supply) * (1 - (slippage / 100)))
          setBottomDisplayString((simulateSellDry(sellingLocks, ammInfo.fsl, ammInfo.psl, ammInfo.supply) * (1 - (slippage / 100))).toFixed(4))
        }
      }
      else {
        setNewFloor(ammInfo.fsl / ammInfo.supply)
        setNewMarket(marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply))
        setNewFsl(ammInfo.fsl)
        setNewPsl(ammInfo.psl)
        setNewSupply(ammInfo.supply)
        setGettingHoney(0)
        setBottomDisplayString('')
      }
    }
  }, [sellingLocks])

  useEffect(() => {
    if(!topInputFlag) {
      const locksAmountWithSlippage: number = findLocksSellAmount(debouncedGettingHoney) * (1 + (slippage/100))
      if(locksAmountWithSlippage < balance.locks) {
        if(!debouncedGettingHoney) {
          setNewFloor(ammInfo.fsl / ammInfo.supply)
          setNewMarket(marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply))
          setNewFsl(ammInfo.fsl)
          setNewPsl(ammInfo.psl)
          setNewSupply(ammInfo.supply)
          setSellingLocks(0)
          setDisplayString('')          
        }
        else {
          setBottomInputFlag(true)
          const locksAmount: number = locksAmountWithSlippage
          !slippageToggle && setDisplayString(locksAmount.toFixed(4))
          !slippageToggle && setSellingLocks(locksAmount)
          simulateSell(locksAmount)
        }
      }
      else {
        setNewFloor(ammInfo.fsl / ammInfo.supply)
        setNewMarket(marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply))
        setNewFsl(ammInfo.fsl)
        setNewPsl(ammInfo.psl)
        setNewSupply(ammInfo.supply)
        setSellingLocks(0)
        setDisplayString('')
      }
    }
  }, [debouncedGettingHoney])

  useEffect(() => {
    if(!bottomInputFlag) {
      if(redeemingLocks <= balance.locks) {
        if(!redeemingLocks) {
          setNewFloor(ammInfo.fsl / ammInfo.supply)
          setNewMarket(marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply))
          setNewFsl(ammInfo.fsl)
          setNewPsl(ammInfo.psl)
          setNewSupply(ammInfo.supply)
          setRedeemingHoney(0)
          setBottomDisplayString('')
        }
        else {
          setTopInputFlag(true)
          simulateRedeem(redeemingLocks)
          setBottomDisplayString((redeemingLocks * floorPrice(ammInfo.fsl, ammInfo.supply)).toFixed(4))
          setRedeemingHoney(redeemingLocks * floorPrice(ammInfo.fsl, ammInfo.supply))
        }
      }
      else {
        setNewFloor(ammInfo.fsl / ammInfo.supply)
        setNewMarket(marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply))
        setNewFsl(ammInfo.fsl)
        setNewPsl(ammInfo.psl)
        setNewSupply(ammInfo.supply)
        setRedeemingHoney(0)
        setBottomDisplayString('')
      }
    }
  }, [redeemingLocks])

  useEffect(() => {
    if(!topInputFlag) {
      if(redeemingHoney / (ammInfo.fsl / ammInfo.supply) <= balance.locks) {
        if(!redeemingHoney) {
          setNewFloor(ammInfo.fsl / ammInfo.supply)
          setNewMarket(marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply))
          setNewFsl(ammInfo.fsl)
          setNewPsl(ammInfo.psl)
          setNewSupply(ammInfo.supply)
          setDisplayString('')
          setRedeemingLocks(0)
        }
        else {
          setBottomInputFlag(true)
          simulateRedeem(redeemingHoney / (ammInfo.fsl / ammInfo.supply))
          setDisplayString((redeemingHoney / (ammInfo.fsl / ammInfo.supply)).toFixed(4))
          setRedeemingLocks(redeemingHoney / (ammInfo.fsl / ammInfo.supply))
        }
      }
      else {
        setNewFloor(ammInfo.fsl / ammInfo.supply)
        setNewMarket(marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply))
        setNewFsl(ammInfo.fsl)
        setNewPsl(ammInfo.psl)
        setNewSupply(ammInfo.supply)
        setDisplayString('')
        setRedeemingLocks(0)
      }
    }
  }, [redeemingHoney])

  function findLocksBuyAmount(debouncedValue: number): number {
    const honey: number = debouncedValue
    let locks: number = honey / marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply)
    let temp: number = 0
    while(parseFloat(temp.toFixed(2)) !== parseFloat(honey.toFixed(2))) {
      temp = simulateBuyDry(locks, ammInfo.fsl, ammInfo.psl, ammInfo.supply)
      if(parseFloat(temp.toFixed(2)) > parseFloat(honey.toFixed(2))) {
        const diff = temp - honey
        if(diff > 100) {
          locks -= 0.01
        }
        else if(diff > 10) {
          locks -= 0.001
        }
        else {
          locks -= 0.0000001
        }
      }
      else if(parseFloat(temp.toFixed(2)) < parseFloat(honey.toFixed(2))) {
        const diff = honey - temp
        if(diff > 100) {
          locks += 0.01
        }
        else if(diff > 10) {
          locks += 0.001
        }
        else {
          locks += 0.0000001
        }
      }
      else {
        const locksWithSlippage: number = locks * (1 - (slippage / 100))
        setBuyingLocks(locksWithSlippage)
        setBottomDisplayString(locksWithSlippage.toFixed(4))
        console.log('found it: ', parseFloat(temp.toFixed(2)))
        console.log('locks: ', locks)
        console.log('with slippage: ', locksWithSlippage)
      }
    }
    return locks
  }

  function findLocksSellAmount(debouncedValue: number): number {
    const honey: number = debouncedValue
    let locks: number = honey / marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply)
    let temp: number = 0
    while(parseFloat(temp.toFixed(2)) !== parseFloat(honey.toFixed(2))) {
      temp = simulateSellDry(locks, ammInfo.fsl, ammInfo.psl, ammInfo.supply)
      if(parseFloat(temp.toFixed(2)) > parseFloat(honey.toFixed(2))) {
        const diff = temp - honey
        if(diff > 100) {
          locks -= 0.01
        }
        else if(diff > 10) {
          locks -= 0.001
        }
        else {
          locks -= 0.0000001
        }
      }
      else if(parseFloat(temp.toFixed(2)) < parseFloat(honey.toFixed(2))) {
        const diff = honey - temp
        if(diff > 100) {
          locks += 0.01
        }
        else if(diff > 10) {
          locks += 0.001
        }
        else {
          locks += 0.0000001
        }
      }
      // else {
        // const locksWithSlippage: number = locks * (1 - (slippage / 100))        
        // console.log('found it: ', parseFloat(temp.toFixed(2)))
        // console.log('locks: ', locks)
        // console.log('with slippage: ', locksWithSlippage)
      // }
    }
    return locks
  }
  
  function simulateBuy(amount: number) {
    let _leftover = amount
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
    simulateFloorRaise(_fsl + _tax, _psl, _supply)
  }
  
  function simulateSell(amount: number) {
    let _leftover = amount
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
  }
  
  function simulateRedeem(amount: number) {
    let rawTotal: number = amount * floorPrice(ammInfo.fsl, ammInfo.supply)
    setNewFsl(ammInfo.fsl - rawTotal)
    setNewSupply(ammInfo.supply - redeemingLocks)
    setNewFloor(floorPrice(ammInfo.fsl - rawTotal, ammInfo.supply - redeemingLocks))
    setNewMarket(marketPrice(ammInfo.fsl - rawTotal, ammInfo.psl, ammInfo.supply - redeemingLocks))
    simulateFloorRaise(ammInfo.fsl - rawTotal, ammInfo.psl, ammInfo.supply - redeemingLocks)
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

  function handlePill(action: number) {
    setDisplayString('')
    setBottomDisplayString('')
    setHoneyBuy(0)
    setBuyingLocks(0)
    setSellingLocks(0)
    setGettingHoney(0)
    setRedeemingLocks(0)
    setRedeemingHoney(0)
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

  function flipTokens() {
    if(buyToggle) {
      setBuyToggle(false)
      setSellToggle(true)
      setRedeemToggle(false)
    }
    if(sellToggle) {
      setBuyToggle(true)
      setSellToggle(false)
      setRedeemToggle(false)
    }
    if(redeemToggle) {
      return
    }
  }
  
  function renderButton() {
    if(buyToggle) {
      if(debouncedHoneyBuy > ammInfo.honeyAmmAllowance) {
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
        if(honeyBuy == 0) {
          return
        }
        const sufficientAllowance: boolean | void = await checkAllowance('honey', contracts.amm.address, honeyBuy, signer)
        if(sufficientAllowance) {
          button && (button.innerHTML = "buying...")
          const buyTx = await sendBuyTx(buyingLocks, honeyBuy, signer)
          buyTx && openNotification({
            title: 'Successfully Purchased $LOCKS!',
            hash: buyTx.hash,
            direction: 'bought',
            amount: buyingLocks,
            price: honeyBuy,
            page: 'amm'
          })
          button && (button.innerHTML = "buy")
          setHoneyBuy(0)
          setDisplayString('')
          setBuyingLocks(0)
          setBottomDisplayString('')
          refreshBalances(wallet, signer)
          refreshInfo(signer)
        }
        else {
          button && (button.innerHTML = "approving...")
          await sendApproveTx('honey', contracts.amm.address, honeyBuy, signer)
          setTimeout(() => {
            button && (button.innerHTML = "buy")
          }, 10000)
        }
      }
      if(sellToggle) {
        if(sellingLocks == 0) {
          return
        }
        button && (button.innerHTML = "selling...")
        const sellTx = await sendSellTx(sellingLocks, gettingHoney, signer)
        sellTx && openNotification({
          title: 'Successfully Sold $LOCKS!',
          hash: sellTx.hash,
          direction: 'sold',
          amount: sellingLocks,
          price: gettingHoney,
          page: 'amm'
        })
        button && (button.innerHTML = "sell")
        setSellingLocks(0)
        setDisplayString('')
        setGettingHoney(0)
        setBottomDisplayString('')
        refreshBalances(wallet, signer)
        refreshInfo(signer)
      }
      if(redeemToggle) {
        if(redeemingLocks == 0) {
          return
        }
        button && (button.innerHTML = "redeeming...")
        const redeemTx = await sendRedeemTx(redeemingLocks, signer)
        redeemTx && openNotification({
          title: 'Successfully Redeemed $LOCKS!',
          hash: redeemTx.hash,
          direction: 'redeemed',
          amount: redeemingLocks,
          price: redeemingHoney,
          page: 'amm'
        })
        button && (button.innerHTML = "redeem")
        setRedeemingLocks(0)
        setRedeemingHoney(0)
        setDisplayString('')
        setBottomDisplayString('')
        refreshBalances(wallet, signer)
        refreshInfo(signer)
      }
    }
  }

  function handlePercentageButtons(action: number) {
    if(action == 1) {
      if(buyToggle) {
        setDisplayString((balance.honey / 4).toFixed(4))
        setHoneyBuy(balance.honey / 4)
      }
      if(sellToggle) {
        setDisplayString((balance.locks / 4).toFixed(4))
        setSellingLocks(balance.locks / 4)        
      }
      if(redeemToggle) {
        setDisplayString((balance.locks / 4).toFixed(4))
        setRedeemingLocks(balance.locks / 4)
      }
    }
    if(action == 2) {
      if(buyToggle) {
        setDisplayString((balance.honey / 2).toFixed(4))
        setHoneyBuy(balance.honey / 2)
      }
      if(sellToggle) {
        setDisplayString((balance.locks / 2).toFixed(4))
        setSellingLocks(balance.locks / 2)
      }
      if(redeemToggle) {
        setDisplayString((balance.locks / 2).toFixed(4))
        setRedeemingLocks(balance.locks / 2)
      }
    }
    if(action == 3) {
      if(buyToggle) {
        setDisplayString((balance.honey * 0.75).toFixed(4))
        setHoneyBuy(balance.honey * 0.75)
      }
      if(sellToggle) {
        setDisplayString((balance.locks * 0.75).toFixed(4))
        setSellingLocks(balance.locks * 0.75)
      }
      if(redeemToggle) {
        setDisplayString((balance.locks * 0.75).toFixed(4))
        setRedeemingLocks(balance.locks * 0.75)
      }
    }
    if(action == 4) {
      if(buyToggle) {
        setDisplayString((balance.honey).toFixed(4))
        setHoneyBuy(balance.honey)
      }
      if(sellToggle) {
        setDisplayString((balance.locks).toFixed(4))
        setSellingLocks(balance.locks)
      }
      if(redeemToggle) {
        setDisplayString((balance.locks).toFixed(4))
        setRedeemingLocks(balance.locks)
      }
    }
  }
  
  function handleTopChange(input: string) {
    setDisplayString(input)
    if(buyToggle) {
      if(!input) {
        setBottomInputFlag(false)
        setHoneyBuy(0)
      }
      else {
        setBottomInputFlag(false)
        setHoneyBuy(parseFloat(input))
      }
    }
    if(sellToggle) {
      if(!input) {
        setBottomInputFlag(false)
        setSellingLocks(0)
      }
      else {
        setBottomInputFlag(false)
        setSellingLocks(parseFloat(input))
      }
    }
    if(redeemToggle) {
      if(!input) {
        setBottomInputFlag(false)
        setRedeemingLocks(0)
      }
      else {
        setBottomInputFlag(false)
        setRedeemingLocks(parseFloat(input))
      }
    }
  }

  function handleBottomChange(input: string) {
    setBottomDisplayString(input)
    if(buyToggle) {
      if(!input) {
        setTopInputFlag(false)
        setBuyingLocks(0)
      }
      else {
        setTopInputFlag(false)
        setBuyingLocks(parseFloat(input))
      }
    }
    if(sellToggle) {
      if(!input) {
        setTopInputFlag(false)
        setGettingHoney(0)
      }
      else {
        setTopInputFlag(false)
        setGettingHoney(parseFloat(input))
      }
    }
    if(redeemToggle) {
      if(!input) {
        setTopInputFlag(false)
        setRedeemingHoney(0)
      }
      else {
        setTopInputFlag(false)
        setRedeemingHoney(parseFloat(input))
      }
    }
  }
  
  function handleTopInput() {
    if(buyToggle) {
      return honeyBuy > balance.honey ? '' : displayString
    }
    if(sellToggle) {
      return sellingLocks > balance.locks ? '' : displayString
    }
    if(redeemToggle) {
      return redeemingLocks > balance.locks ? '' : displayString
    }
  }

  function handleBottomInput() {
    if(buyToggle) {
      return simulateBuyDry(buyingLocks, ammInfo.fsl, ammInfo.psl, ammInfo.supply) > balance.honey ? '' : bottomDisplayString
    }
    if(sellToggle) {
      return bottomDisplayString
    }
    if(redeemToggle) {
      return redeemingHoney / (ammInfo.fsl / ammInfo.supply) > balance.locks ? '' : bottomDisplayString
    }
  }

  function handleTopBalance() {
    if(buyToggle) {
      return balance.honey > 0 ? balance.honey.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
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
      return balance.locks > 0 ? balance.locks.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
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
        <animated.div className="w-[57%] flex flex-col pt-6 pb-4 px-24 rounded-xl bg-slate-300 ml-24 mt-8 h-[95%] border-2 border-black" style={springs}>
          { popupToggle && 
            <div className="z-10 bg-white rounded-xl border-2 border-black w-36 h-36 left-[58%] top-[30%] absolute px-4">
              <span className="absolute right-2 rounded-full border-2 border-black px-2 top-2 hover:bg-black hover:text-white cursor-pointer" onClick={() => setPopupToggle(false)}>x</span>
              <p className="mt-10 mx-auto font-acme">burn n locks to receive floor price value</p>
            </div>
          }
          <h1 className="text-[50px] font-acme text-[#ffff00]" id="text-outline" onClick={() => test()} >goldilocks AMM</h1>
          <div className="flex flex-row ml-2 items-center justify-between">
            <h3 className="font-acme text-[24px] ml-2">trading between $honey & $locks</h3>
            <div className="flex flex-row items-center">
              <h1 className="mr-4 text-[28px] hover:opacity-25 hover:cursor-pointer" onClick={() => setSlippageToggle(true)}>⚙️</h1>
              <div className="flex flex-row bg-white rounded-2xl border-2 border-black">
                <div className={`font-acme w-24 py-2 ${buyToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-l-2xl text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(1)}>buy</div>
                <div className={`font-acme w-24 py-2 ${sellToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] text-center border-r-2 border-black cursor-pointer`} onClick={() => handlePill(2)}>sell</div>
                <div className={`font-acme w-24 py-2 ${redeemToggle ? "bg-[#ffff00]" : "bg-white"} hover:bg-[#d6d633] rounded-r-2xl text-center cursor-pointer`} onClick={() => handlePill(3)}>redeem
                  <span className="ml-1 rounded-full px-2 border-2 border-black hover:bg-black hover:text-white" 
                      onClick={(e) => {
                        e.stopPropagation()
                        setPopupToggle(true)
                      }}
                    >?
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-[75%] relative mt-4 flex flex-col">
            <div className="h-[67%] px-6">
              { slippageToggle && 
                <div className="fixed z-999 bg-[#ffffb4] rounded-xl border-2 border-black w-[25%] left-[40%] top-[40%] px-4 opacity-100">
                  <span className="absolute right-3 rounded-full border-2 border-black text-[1.2rem] px-3 top-3 hover:bg-black hover:text-white cursor-pointer" onClick={() => setSlippageToggle(false)}>x</span>
                  <div className="flex flex-col font-acme">
                    <h3 className="mt-5 mx-auto text-[2rem]">set slippage</h3>
                    <div className="mx-auto w-[50%] relative">
                      <input className="border-none focus:outline-none bg-slate-100 pl-[15%] font-acme rounded-xl my-5 py-1 text-[1.5rem]" type="number" value={slippageDisplayString} 
                        onChange={(e) => {
                          setSlippageDisplayString(e.target.value)
                            if(!e.target.value) {
                              setSlippage(0)
                            }
                            else {
                              setSlippage(parseFloat(e.target.value))
                            }
                          
                        }} 
                        id="number-input" 
                      />
                      <p className="absolute right-[5%] top-[35%] text-[1.2rem]">%</p>
                    </div>
                  </div>
                </div>
              }
              <div className="rounded-3xl border-2 border-black mt-2 h-[50%] bg-white flex flex-col">
                <div className="h-[50%] flex flex-row items-center justify-between">
                  <div className="rounded-[50px] m-6 p-2 flex flex-row bg-slate-100 border-2 border-black items-center">{useLabel(buyToggle, sellToggle, redeemToggle, "topToken")}</div>
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
              <div className="absolute top-[31%] left-[50%] h-10 w-10 bg-[#ffff00] border-2 border-black rounded-3xl flex justify-center items-center" onClick={() => flipTokens()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D111C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
              </div>
              <div className="rounded-3xl border-2 border-black mt-2 h-[50%] bg-white flex flex-col">
                <div className="h-[50%] flex flex-row items-center">
                  <div className="rounded-[50px] m-6 p-2 flex flex-row bg-slate-100 border-2 border-black items-center">{useLabel(buyToggle, sellToggle, redeemToggle, "bottomToken")}</div>
                </div>
                <div className="h-[50%] pl-10 flex flex-row items-center justify-between">
                  <input className="border-none focus:outline-none bg-transparent font-acme rounded-xl text-[40px]" placeholder="0.00" value={handleBottomInput()} onChange={(e) => handleBottomChange(e.target.value)} type="number" id="number-input" />
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
                <p className={`${floorPrice(ammInfo.fsl, ammInfo.supply) > newFloor ? "text-red-600" : floorPrice(ammInfo.fsl, ammInfo.supply) == newFloor ? "" : "text-green-600"} font-acme text-[20px]`}>${ floorPrice(ammInfo.fsl, ammInfo.supply) == newFloor ? "-" : newFloor.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                <p className={`${marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply) > newMarket ? "text-red-600" : marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply) == newMarket ? "" : "text-green-600"} font-acme text-[20px]`}>${ marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply) == newMarket ? "-" : newMarket.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                <p className={`${ammInfo.fsl > newFsl ? "text-red-600" : ammInfo.fsl == newFsl ? "" : "text-green-600"} font-acme text-[20px]`}>{ ammInfo.fsl == newFsl ? "-" : newFsl.toLocaleString('en-US', { maximumFractionDigits: 2 }) }</p>
                <p className={`${ammInfo.psl > newPsl ? "text-red-600" : ammInfo.psl == newPsl ? "" : "text-green-600"} font-acme text-[20px]`}>{ ammInfo.psl == newPsl ? "-" : newPsl.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
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