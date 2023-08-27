type PopupProp = {
  setPopupToggle: (_bool: boolean) => void;
}

export const RealizePopup = ({ setPopupToggle }: PopupProp) => {

  return (
    <div className="z-50 bg-white rounded-xl border-2 border-black w-36 h-36 left-[80%] lg:left-[58%] top-[30%] absolute px-4">
      <span 
        className="absolute right-2 rounded-full border-2 border-black px-2 top-2 hover:bg-black hover:text-white cursor-pointer" 
        onClick={() => setPopupToggle(false)}
      >
        x
      </span>
      <p className="pt-[35%] mx-auto font-acme">burn n porridge to buy n locks at floor price</p>
    </div>
  )
}