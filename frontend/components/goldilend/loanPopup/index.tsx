import { useGoldilend, useNotification } from "../../../providers"
import { useGoldilendTx } from "../../../hooks"

type PopupProp = {
  setPopupToggle: (_bool: boolean) => void;
}

export const LoanPopup = ({ setPopupToggle }: PopupProp) => {

  const {
    loanAmount,
    loanExpiration,
    selectedBeras,
    setLoanPopupToggle,
    changeActiveToggle
  } = useGoldilend()

  const { sendBorrowTx } = useGoldilendTx()
  const { openNotification } = useNotification()

  const parseDate = (dateString: string): number => {
    const dateParts = dateString.split('-')
    const [month, day, year] = dateParts.map(Number);
    const parsedDate = new Date(year, month - 1, day)
    const timestamp = parsedDate.getTime()
    const timestampDigits = Math.floor(timestamp / 1000)
    return timestampDigits
  }

  const handleButtonClick = async () => {
    const button = document.getElementById('amm-button')
    button && (button.innerHTML = "creating loan...")
    const borrowTx = await sendBorrowTx(loanAmount, selectedBeras, parseDate(loanExpiration) - Math.floor(Date.now() / 1000))
    borrowTx && openNotification({
      title: 'Successfully Created a Loan!',
      hash: borrowTx,
      direction: 'borrowed',
      amount: loanAmount,
      price: 0,
      page: 'goldilend'
    })
    button && (button.innerHTML = "create loan")
    setLoanPopupToggle(false)
    changeActiveToggle('loan')
  }

  return (
    <div className="absolute z-10 top-[20%] left-[40%] h-[60%] w-[20%] bg-white flex flex-col items-center py-8 rounded-xl border-2 border-black font-acme" id="home-button">
      <span 
        className="absolute right-2 rounded-full border-2 border-black px-2 top-2 hover:bg-black hover:text-white cursor-pointer"
        onClick={() => setPopupToggle(false)}
      >
        x
      </span>
      <h1 className="pb-[5%] text-[24px]">confirm loan plz</h1>
      <div className="flex flex-col w-[100%] h-[70%] p-2 justify-between">
        <div className="w-[100%] h-[25%]">
          <h1 className="text-[24px] ml-2">loan amount</h1>
          <h1 className="text-[20px] ml-6">{loanAmount}</h1>
        </div>
        <div className="w-[100%] h-[25%]">
          <h1 className="text-[24px] ml-2">expiration</h1>
          <h1 className="text-[20px] ml-6">{loanExpiration}</h1>
        </div>
        <div className="w-[100%] h-[50%]">
          <h1 className="text-[24px] ml-2">collateral</h1>
          <div className="w-[100%] h-[80%] flex flex-wrap py-2 pr-2">
            {
              selectedBeras.map((bera) => (
                <img
                  className="ml-[5%] w-[50px] h-[50px] rounded-xl"
                  src={bera.imageSrc}
                  alt="selected"
                  id="home-button"
                />
              ))
            }
          </div>
        </div>
      </div>
      <button 
        className="w-[55%] h-[10%] mt-[10%] mx-auto border-2 border-black rounded-xl text-[22px]"
        onClick={(e) => {
          e.stopPropagation()
          handleButtonClick()
        }}
        id="amm-button"
      >
        create loan
      </button>
    </div>
  )
}