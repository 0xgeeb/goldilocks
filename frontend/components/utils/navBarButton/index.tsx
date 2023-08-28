type PopupProps = {
  burgerPopupToggle: boolean;
  setBurgerPopupToggle: React.Dispatch<React.SetStateAction<boolean>>;
  setAccountPopupToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NavBarButton = ({ burgerPopupToggle, setBurgerPopupToggle, setAccountPopupToggle }: PopupProps) => {

  return (
    <>
      <div 
        className="relative flex flex-col lg:hidden border-2 border-black h-[50%] w-[5%] rounded-xl cursor-pointer hover:scale-125" 
        id="home-button"
        onClick={() => setBurgerPopupToggle(prev => !prev)}
      >
        <div className="absolute border-2 border-b-black border-transparent left-[10%] w-[80%] h-[25%] top-[0%]  rounded"></div>
        <div className="absolute border-2 border-b-black border-transparent left-[10%] w-[80%] h-[25%] top-[30%] rounded"></div>
        <div className="absolute border-2 border-b-black border-transparent left-[10%] w-[80%] h-[25%] top-[60%] rounded"></div>
      </div>
      { burgerPopupToggle && 
        <div className="z-40 absolute lg:hidden left-[65%] w-[30%] top-[10%] h-[40%] border-2 border-black rounded-xl bg-[rgba(255,255,0,0.27298669467787116)]">
          gold
        </div>
      }
    </>
  )
}