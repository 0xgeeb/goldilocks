import { TitleBar, TabToggle } from ".."

export const GoldilendMainBox = () => {
  return (
    <div className="w-[95%] lg:w-[57%] rounded-xl bg-slate-300 bg-grid-slate-100 ml-[2%] mt-[1%] h-[78%] border-2 border-black">
      <div className="h-[100%] flex flex-col py-3 px-4 2xl:py-6 2xl:px-12 rounded-xl bg-gradient-to-tr from-transparent via-slate-300 to-slate-300">
        <TitleBar />
        <TabToggle />
      </div>
    </div>
  )
}