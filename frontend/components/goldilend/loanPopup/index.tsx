type PopupProp = {
  setPopupToggle: (_bool: boolean) => void;
}

export const LoanPopup = ({ setPopupToggle }: PopupProp) => {

  return (
    <div className="absolute z-10 h-[40%] w-[40%] bg-white rounded-xl border-2 border-black">
      <span 
        className="absolute right-2 rounded-full border-2 border-black px-2 top-2 hover:bg-black hover:text-white cursor-pointer"
        onClick={() => setPopupToggle(false)}
      >
        x
      </span>
      <h1>confirm loan plz</h1>
    </div>
  )
}