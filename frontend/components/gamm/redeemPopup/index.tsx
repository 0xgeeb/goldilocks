import { RedeemPopupProps } from "../../../utils/interfaces"

export const RedeemPopup = ({ popupToggle, setPopupToggle }: RedeemPopupProps) => {

  return (
    <>
      { popupToggle && 
        <div className="z-10 bg-white rounded-xl border-2 border-black w-36 h-36 left-[55%] top-[30%] absolute px-4">
          <span className="absolute right-2 rounded-full border-2 border-black px-2 top-2 hover:bg-black hover:text-white cursor-pointer" onClick={() => setPopupToggle(false)}>x</span>
          <p className="mt-10 mx-auto font-acme">burn n locks to receive floor price value</p>
        </div>
      }
    </>
  )
}