import {
  useGamm, 
  useWallet,
  useNotification
} from "../../../providers"
import { useGammTx } from "../../../hooks/gamm"

export const GammButton = () => {

  const { 
    activeToggle, 
    debouncedHoneyBuy, 
    gammInfo,
    honeyBuy,
    setHoneyBuy,
    sellingLocks,
    setSellingLocks,
    setDisplayString,
    buyingLocks,
    setBuyingLocks,
    gettingHoney,
    setGettingHoney,
    redeemingLocks,
    redeemingHoney,
    setRedeemingHoney,
    setRedeemingLocks,
    setBottomDisplayString,
    refreshGammInfo
  } = useGamm()

  const { 
    wallet,
    isConnected, 
    network,
    refreshBalances
  } = useWallet()

  const { 
    checkAllowance,
    sendApproveTx,
    sendBuyTx,
    sendSellTx,
    sendRedeemTx
   } = useGammTx()

  const { openNotification } = useNotification()

  const refreshInfo = () => {
    setDisplayString('')
    setBottomDisplayString('')
    setHoneyBuy(0)
    setBuyingLocks(0)
    setSellingLocks(0)  
    setGettingHoney(0)
    setRedeemingLocks(0)
    setRedeemingHoney(0)
    refreshBalances()
    refreshGammInfo()
  }

  const renderButton = () => {
    if(activeToggle === 'buy') {
      if(isConnected && debouncedHoneyBuy > gammInfo.honeyAmmAllowance) {
        return 'approve use of $honey'
      }
      return 'buy'
    }
    else if(activeToggle === 'sell') {
      return 'sell'
    }
    else {
      return 'redeem'
    }
  }

  const buyTxFlow = async (button: HTMLElement | null) => {
    if(honeyBuy == 0) {
      return
    }
    const sufficientAllowance: boolean | void = await checkAllowance(honeyBuy, wallet)
    if(sufficientAllowance) {
      button && (button.innerHTML = "buying...")
      const buyTx = await sendBuyTx(buyingLocks, honeyBuy)
      buyTx && openNotification({
        title: 'Successfully Purchased $LOCKS!',
        hash: buyTx,
        direction: 'bought',
        amount: buyingLocks,
        price: honeyBuy,
        page: 'amm'
      })
      button && (button.innerHTML = "buy")
      refreshInfo()
    }
    else {
      button && (button.innerHTML = "approving...")
      await sendApproveTx(honeyBuy)
      setTimeout(() => {
        button && (button.innerHTML = "buy")
      }, 10000)
    }
  }

  const sellTxFlow = async (button: HTMLElement | null) => {
    if(sellingLocks == 0) {
      return
    }
    button && (button.innerHTML = "selling...")
    const sellTx = await sendSellTx(sellingLocks, gettingHoney)
    sellTx && openNotification({
      title: 'Successfully Sold $LOCKS!',
      hash: sellTx,
      direction: 'sold',
      amount: sellingLocks,
      price: gettingHoney,
      page: 'amm'
    })
    button && (button.innerHTML = "sell")
    refreshInfo()
  }

  const redeemTxFlow = async (button: HTMLElement | null) => {
    if(redeemingLocks == 0) {
      return
    }
    button && (button.innerHTML = "redeeming...")
    const redeemTx = await sendRedeemTx(redeemingLocks)
    redeemTx && openNotification({
      title: 'Successfully Redeemed $LOCKS!',
      hash: redeemTx,
      direction: 'redeemed',
      amount: redeemingLocks,
      price: redeemingHoney,
      page: 'amm'
    })
    button && (button.innerHTML = "redeem")
    refreshInfo()
  }

  const handleButtonClick = async () => {
    const button = document.getElementById('amm-button')

    console.log(typeof(button))

    if(!isConnected) {
      button && (button.innerHTML = "where wallet")
    }
    else if(network !== "Avalanche Fuji C-Chain") {
      button && (button.innerHTML = "switch to fuji plz")
    }
    else {
      if(activeToggle === 'buy') {
        buyTxFlow(button)
      }
      if(activeToggle === 'sell') {
        sellTxFlow(button)
      }
      if(activeToggle === 'redeem') {
        redeemTxFlow(button)
      }
    }
  }

  return (
    <div className="h-[31%] flex justify-center items-center">
      <button 
        className="h-[55%] w-[50%] bg-white rounded-xl py-1 2xl:py-3 px-4 2xl:px-6 border-2 border-black font-acme text-[25px] 2xl:text-[30px]" 
        id="amm-button" 
        onClick={() => handleButtonClick()} 
      >
        {renderButton()}
      </button>
    </div>
  )
}