import {
  TitleBar,
  StakeBox,
  StatsBox
} from ".."

export const StakingMainBox = () => {

  return (
    <div className="w-[57%] rounded-xl bg-slate-300 bg-grid-slate-100 ml-24 mt-12 h-[700px] border-2 border-black">
      <div className="flex rounded-xl flex-col h-[100%] bg-gradient-to-tr from-transparent via-slate-300 to-slate-300 pt-8 pb-2 px-16 ">
        <TitleBar />
        <div className="h-[100%] mt-4 flex flex-row">
          <StakeBox />
          <StatsBox />
        </div>
      </div>
    </div>
  )
}