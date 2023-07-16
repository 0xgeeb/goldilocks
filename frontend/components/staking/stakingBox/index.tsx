import {
  TitleBar,
  StakeBox,
  StatsBox
} from "../../staking"

export const StakingBox = () => {

  return (
    <div className="w-[57%] flex flex-col pt-8 pb-2 px-16 rounded-xl bg-slate-300 ml-24 mt-12 h-[700px] border-2 border-black">
      <TitleBar />
      <div className="h-[100%] mt-4 flex flex-row">
        <StakeBox />
        <StatsBox />
      </div>
    </div>
  )
}