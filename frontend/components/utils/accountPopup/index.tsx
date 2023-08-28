import {
  useWallet,
  useBorrowing,
  useStaking
} from "../../../providers"

type PopupProp = {
  setPopupToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AccountPopup = ({ setPopupToggle }: PopupProp) => {

  const { balance } = useWallet()
  const { borrowInfo } = useBorrowing()
  const { stakingInfo } = useStaking()

  const formatAsString = (num: number): string => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }

  const handleInfo = (num: number) => {
    if(num > 0) {
      return formatAsString(num)
    }
    else {
      return "-"
    }
  }

  return (
    <div className="w-[60%] lg:w-[30%] h-[30%] bg-white absolute z-50 left-[20%] lg:left-[35%] top-[35%] rounded-xl border-2 border-black p-4" id="account-popup">
      <span 
        className="absolute right-2 rounded-full border-2 border-black px-2 top-2 hover:bg-black hover:text-white cursor-pointer" 
        onClick={() => setPopupToggle(false)}
      >
        x
      </span>
      <div className="w-full h-full flex flex-col">
        <h1 className="mx-auto text-[1.5rem] font-acme text-[#ffff00]" id="text-outline">goldilocks holdings</h1>
        <div className="flex flex-row w-[60%] lg:w-[50%] justify-between mx-auto mt-[5%] font-acme text-[15px] 2xl:text-[18px]">
          {/* todo: add goldilend info here */}
          <div className="flex flex-col">
            <p>locks balance</p>
            <p>porridge balance</p>
            <p>honey balance</p>
            <p>staked locks</p>
            <p>claimable prg</p>
            <p>locked locks</p>
            <p>borrowed honey</p>
          </div>
          <div className="flex flex-col">
            <p>{handleInfo(balance.locks)}</p>
            <p>{handleInfo(balance.prg)}</p>
            <p>{handleInfo(balance.honey)}</p>
            <p>{handleInfo(borrowInfo.staked)}</p>
            <p>{handleInfo(stakingInfo.yieldToClaim)}</p>
            <p>{handleInfo(borrowInfo.locked)}</p>
            <p>{handleInfo(borrowInfo.borrowed)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}