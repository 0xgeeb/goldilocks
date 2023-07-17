import {
  TitleBar,
  BorrowBox,
  StatsBox
} from ".."

export const BorrowMainBox = () => {

  return (
    <div className="w-[57%] flex flex-col pt-8 pb-2 px-3 rounded-xl bg-slate-300 ml-24 mt-12 h-[700px] border-2 border-black">
      <TitleBar />
      <div className="flex flex-row mt-4 h-[100%] justify-between">
        <BorrowBox />
        <StatsBox />
      </div>
    </div>
  )
}