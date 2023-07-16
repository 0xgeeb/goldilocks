import {
  useStaking,
  useWallet,
  useNotification
} from "../../../providers"

export const StakingButton = () => {

  const handleButtonClick = () => {
    return ''
  }

  const renderButton = () => {
    return ''
  }

  return (
    <div className="h-[15%] w-[80%] mx-auto mt-6">
      <button className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[30px]" id="amm-button" onClick={() => handleButtonClick()} >{renderButton()}</button>
    </div>
  )
}