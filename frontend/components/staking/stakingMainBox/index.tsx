import {
  TitleBar,
  StakeBox,
  StatsBox
} from ".."

export const StakingMainBox = () => {

  return (
    <div className="w-[95%] lg:w-[57%] rounded-xl bg-slate-300 bg-grid-slate-100 ml-[2%] mt-[1%] h-[78%] border-2 border-black">
      <div className="flex rounded-xl flex-col h-[100%] bg-gradient-to-tr from-transparent via-slate-300 to-slate-300 pt-8 px-8">
        <TitleBar />
        <div className="h-[100%] mt-4 flex flex-row">
          <StakeBox />
          <StatsBox />
        </div>
      </div>
    </div>
  )
}