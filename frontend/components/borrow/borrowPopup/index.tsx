type PopupProp = {
  setPopupToggle: (_bool: boolean) => void;
}

export const BorrowPopup = ({ setPopupToggle }: PopupProp) => {

  return (
    <div className="z-50 bg-white rounded-xl border-2 border-black w-36 h-36 left-[80%] lg:left-[58%] top-[30%] absolute px-4">
      <span 
        className="absolute right-2 rounded-full border-2 border-black px-2 top-2 hover:bg-black hover:text-white cursor-pointer" 
        onClick={() => setPopupToggle(false)}
      >
        x
      </span>
      <p className="pt-[20%] mx-auto font-acme">there is a 3% loan origination fee on all borrows</p>
    </div>
  )
}