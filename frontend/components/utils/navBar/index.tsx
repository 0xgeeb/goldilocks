import { NavBarButton, NavBarButtons } from "../../utils"

type PopupProps = {
  burgerPopupToggle: boolean;
  setBurgerPopupToggle: React.Dispatch<React.SetStateAction<boolean>>;
  setAccountPopupToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NavBar = ({ burgerPopupToggle, setBurgerPopupToggle, setAccountPopupToggle }: PopupProps) => {

  return (
    <>
      <div className="w-[100%] h-[10%] lg:h-[15%] flex flex-row items-center justify-between px-10 py-4 2xl:px-24 2xl:py-8">
        <a href="/">
          <div className="flex flex-row items-center hover:opacity-25">
            <img 
              className="h-[72px] w-[72px] 2xl:w-[96px] 2xl:h-[96px]" 
              src="/yellow_transparent_logo.png"
              alt="logo"
            />
            <h1 className="text-[35px] 2xl:text-[45px] ml-5 font-acme">Goldilocks Alpha</h1>
          </div>
        </a>
        <NavBarButton
          burgerPopupToggle={burgerPopupToggle}
          setBurgerPopupToggle={setBurgerPopupToggle} 
          setAccountPopupToggle={setAccountPopupToggle}
        />
        <NavBarButtons setPopupToggle={setAccountPopupToggle} />
      </div>
    </>
  )
}