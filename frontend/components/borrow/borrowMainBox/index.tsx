import {
  TitleBar,
  BorrowBox,
  StatsBox
} from ".."

export const BorrowMainBox = () => {

  return (
    <div className="w-[57%] rounded-xl bg-slate-300 bg-grid-slate-100 ml-[2%] mt-[1%] h-[78%] border-2 border-black">
      <div className="h-[100%] flex flex-col pt-8 px-8 rounded-xl bg-gradient-to-tr from-transparent via-slate-300 to-slate-300">
        <TitleBar />
        <div className="flex flex-row mt-4 h-[100%] justify-between">
          <BorrowBox />
          <StatsBox />
        </div>
      </div>
    </div>
  )
}