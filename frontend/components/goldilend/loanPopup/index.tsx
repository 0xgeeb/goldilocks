import { useGoldilend } from "../../../providers"
import { useGoldilendTx } from "../../../hooks/goldilend"

type PopupProp = {
  setPopupToggle: (_bool: boolean) => void;
}

export const LoanPopup = ({ setPopupToggle }: PopupProp) => {

  const {
    loanAmount,
    loanExpiration,
    selectedBeras,
    getOwnedBeras
  } = useGoldilend()

  // const { send}

  return (
    <div className="absolute z-10 top-[20%] left-[40%] h-[60%] w-[20%] bg-white flex flex-col items-center py-8 rounded-xl border-2 border-black font-acme" id="home-button">
      <span 
        className="absolute right-2 rounded-full border-2 border-black px-2 top-2 hover:bg-black hover:text-white cursor-pointer"
        onClick={() => setPopupToggle(false)}
      >
        x
      </span>
      <h1 className="pb-[5%] text-[24px]">confirm loan plz</h1>
      <div className="flex flex-col w-[100%] h-[70%] p-2 justify-between">
        <div className="w-[100%] h-[25%]">
          <h1 className="text-[24px] ml-2">loan amount</h1>
          <h1 className="text-[20px] ml-6">{loanAmount}</h1>
        </div>
        <div className="w-[100%] h-[25%]">
          <h1 className="text-[24px] ml-2">expiration</h1>
          <h1 className="text-[20px] ml-6">{loanExpiration}</h1>
        </div>
        <div className="w-[100%] h-[50%]">
          <h1 className="text-[24px] ml-2">collateral</h1>
          <div className="w-[100%] h-[80%] flex flex-wrap py-2 pr-2">
            {
              selectedBeras.map((bera) => (
                <img
                  className="ml-[5%] w-[50px] h-[50px] rounded-xl"
                  src={bera.imageSrc}
                  alt="selected"
                  id="home-button"
                />
              ))
            }
          </div>
        </div>
      </div>
      <button 
        className="w-[55%] h-[10%] mt-[10%] mx-auto border-2 border-black rounded-xl text-[22px]"
        id="amm-button"
      >
        create loan
      </button>
    </div>
  )
}