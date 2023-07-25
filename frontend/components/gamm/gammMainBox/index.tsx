import { 
  TitleBar,
  TradeBox,
  StatsBox
} from ".."

export const GammMainBox = () => {

  return (
    <div className="w-[95%] lg:w-[57%] rounded-xl bg-slate-300 bg-grid-slate-100 ml-[2%] mt-[1%] h-[99%] border-2 border-black">
      <div className="h-[100%] flex flex-col py-3 px-8 2xl:py-6 2xl:px-16 rounded-xl bg-gradient-to-tr from-transparent via-slate-300 to-slate-300">
        <TitleBar />
        <TradeBox />
        <StatsBox />
      </div>
    </div>
  )
}