"use client"

import { useState } from "react"
import { BorrowMainBox, BorrowPopup } from "../../borrow"
import { 
  NavBar, 
  AccountPopup,
  RotatingImages
} from "../../utils"
import { useBorrowing } from "../../../providers"

export const BorrowPage = () => {

  const [accountPopupToggle, setAccountPopupToggle] = useState<boolean>(false)
  const [burgerPopupToggle, setBurgerPopupToggle] = useState<boolean>(false)
  const { borrowPopupToggle, setBorrowPopupToggle } = useBorrowing()

  const handlePopups = () => {
    if(accountPopupToggle) {
      setAccountPopupToggle(false)
    }
    if(borrowPopupToggle) {
      setBorrowPopupToggle(false)
    }
  }

  return (
    <div 
      className="w-screen h-screen" 
      id="page-div"
      onClick={() => handlePopups()}
    >
      { borrowPopupToggle && <BorrowPopup setPopupToggle={setBorrowPopupToggle} /> }
      { accountPopupToggle && <AccountPopup setPopupToggle={setAccountPopupToggle} /> }
      <NavBar
        burgerPopupToggle={burgerPopupToggle}
        setBurgerPopupToggle={setBurgerPopupToggle} 
        setAccountPopupToggle={setAccountPopupToggle}
      />
      <BorrowMainBox />
      <RotatingImages />
    </div>
  )
}