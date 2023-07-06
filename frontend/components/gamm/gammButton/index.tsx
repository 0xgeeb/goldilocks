import { useInfo } from "../../../providers"

export const GammButton = () => {

  const { testNumber, changeTestNumber } = useInfo()

  const handleButtonClick = () => {
    console.log('clicked')
    changeTestNumber(69)
  }

  const renderButton = () => {
    return 'button'
  }

  return (
    <div className="h-[33%] w-[100%] flex justify-center items-center">
      <button className="h-[50%] w-[50%] bg-white rounded-xl mt-5 py-3 px-6 border-2 border-black font-acme text-[30px]" id="amm-button" onClick={() => handleButtonClick()} >{renderButton()}</button>
    </div>
  )
}