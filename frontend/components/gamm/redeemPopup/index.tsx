type PopupProp = {
  setPopupToggle: (_bool: boolean) => void;
}

export const RedeemPopup = ({ setPopupToggle }: PopupProp) => {

  return (
    <div className="z-10 bg-white rounded-xl border-2 border-black w-36 h-36 left-[84%] lg:left-[55%] top-[34%] absolute px-4">
      <span 
        className="absolute right-2 rounded-full border-2 border-black px-2 top-2 hover:bg-black hover:text-white cursor-pointer"
        onClick={() => setPopupToggle(false)}
      >
        x
      </span>
      <p className="pt-[30%] mx-auto font-acme">burn n locks to receive floor price value</p>
    </div>
  )
}