export const HomeTitle = () => {

  return (
    <div className="absolute top-[30%] left-[9%] 2xl:left-[11%] py-4 font-acme">
      <h1 className="text-[3rem] 2xl:text-[4rem]">cooking up porridge for beras</h1>
      <h3 className="text-[1.3rem] 2xl:text-[1.5rem]">DAO governed defi on Berachain</h3>
      <div className="mt-5 flex flex-row items-center">
        <a href="https://goldilocks-1.gitbook.io/goldidocs/" target="_blank">
          <button 
            className="w-32 2xl:w-36 py-1 2xl:py-2 text-[1.1rem] 2xl:text-[1.2rem] bg-slate-200 hover:scale-[120%] rounded-xl" 
            id="home-button"
          >
            GoldiDOCS
          </button>
        </a>
        <a href="https://twitter.com/goldilocksmoney" target="_blank">
          <img 
            className="h-[25px] w-[25px] ml-6 rounded-3xl hover:opacity-25"
            src="/twitter.png"
            alt="twitter"
            id="home-twitter-image"
          />
        </a>
      </div>
    </div>
  )
}