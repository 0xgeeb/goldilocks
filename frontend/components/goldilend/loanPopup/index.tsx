import { useGoldilend } from "../../../providers"

type PopupProp = {
  setPopupToggle: (_bool: boolean) => void;
}

export const LoanPopup = ({ setPopupToggle }: PopupProp) => {

  const {
    loanAmount
  } = useGoldilend()

  return (
    <div className="absolute z-10 top-[20%] left-[40%] h-[60%] w-[20%] bg-white flex flex-col items-center py-8 rounded-xl border-2 border-black" id="home-button">
      <span 
        className="absolute right-2 rounded-full border-2 border-black px-2 top-2 hover:bg-black hover:text-white cursor-pointer"
        onClick={() => setPopupToggle(false)}
      >
        x
      </span>
      <h1 className="font-acme pb-[5%] text-[24px]">confirm loan plz</h1>
      <div className="flex flex-col w-[100%] h-[90%] justify-between">
        <h1>loan amount {loanAmount}</h1>
        <h1>duration</h1>
        <h1>collateral</h1>
      </div>
    </div>
  )
}