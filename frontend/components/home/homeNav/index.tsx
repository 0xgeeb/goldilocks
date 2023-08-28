export const HomeNav = () => {

  return (
    <div className="w-[100%] h-[10%] lg:h-[15%] flex flex-row items-center justify-between px-10 py-4 2xl:px-24 2xl:py-8">
      <a href="/">
        <div className="flex flex-row items-center hover:opacity-25">
          <img 
            className="h-[72px] w-[72px] 2xl:w-[96px] 2xl:h-[96px]" 
            src="/yellow_transparent_logo.png" 
            alt="logo"
          />
          <h1 className="text-[35px] 2xl:text-[45px] ml-5 font-acme">Goldilocks Alpha</h1>
        </div>
      </a>
      <div className="flex flex-row">
        <a href="/gamm">
          <button 
            className="w-20 2xl:w-24 py-2 text-[16px] 2xl:text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" 
            id="home-button"
          >
            gamm
          </button>
        </a>
        <a href="/goldilend">
          <button 
            className="w-20 2xl:w-24 py-2 text-[16px] 2xl:text-[18px] bg-slate-200 hover:scale-[120%] rounded-xl mr-4 font-acme" 
            id="home-button"
          >
            goldilend
          </button>
        </a>
      </div>
    </div>
  )
}