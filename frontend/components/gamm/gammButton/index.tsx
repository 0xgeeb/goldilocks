import { useGamm, useWallet } from "../../../providers"

export const GammButton = () => {

  const { activeToggle, debouncedHoneyBuy, gammInfo } = useGamm()
  const { isConnected } = useWallet()

  const handleButtonClick = () => {
    console.log('clicked')
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

  return (
    <div className="h-[33%] w-[100%] flex justify-center items-center">
      <button className="h-[50%] w-[50%] bg-white rounded-xl py-3 px-6 border-2 border-black font-acme text-[30px]" id="amm-button" onClick={() => handleButtonClick()} >{renderButton()}</button>
    </div>
  )
}