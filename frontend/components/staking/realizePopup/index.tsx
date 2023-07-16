import { PopupProps } from "../../../utils/interfaces"

export const RealizePopup = ({ popupToggle, setPopupToggle }: PopupProps) => {

  return (
    <>
      { popupToggle && 
        <div className="z-10 bg-white rounded-xl border-2 border-black w-36 h-36 left-[60%] top-[30%] absolute px-4">
          <span className="absolute right-2 rounded-full border-2 border-black px-2 top-2 hover:bg-black hover:text-white cursor-pointer" onClick={() => setPopupToggle(false)}>x</span>
          <p className="mt-10 mx-auto font-acme">burn n porridge to buy n locks at floor price</p>
        </div>
      }
    </>
  )
}