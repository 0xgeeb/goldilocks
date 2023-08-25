type PopupProp = {
  setPopupToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AccountPopup = ({ setPopupToggle }: PopupProp) => {
  return (
    <div className="h-[50%] w-[50%] bg-red-400 absolute z-50 left-[25%] top-[25%]">
      <p onClick={() => setPopupToggle(false)}>x</p>
    </div>
  )
}