export const StatsBox = () => {
  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-row w-[55%] px-3 ml-3 justify-between rounded-xl border-2 border-black mt-2 bg-white">
        {/* <LeftAmmBoxText />
        <LeftAmmBoxCurNums floor={floorPrice(ammInfo.fsl, ammInfo.supply)} market={marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply)} fsl={ammInfo.fsl} psl={ammInfo.psl} />
        <div className="flex flex-col items-end justify-between">
          <p className={`${floorPrice(ammInfo.fsl, ammInfo.supply) > newFloor ? "text-red-600" : floorPrice(ammInfo.fsl, ammInfo.supply) == newFloor ? "" : "text-green-600"} font-acme text-[20px]`}>${ floorPrice(ammInfo.fsl, ammInfo.supply) == newFloor ? "-" : newFloor.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
          <p className={`${marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply) > newMarket ? "text-red-600" : marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply) == newMarket ? "" : "text-green-600"} font-acme text-[20px]`}>${ marketPrice(ammInfo.fsl, ammInfo.psl, ammInfo.supply) == newMarket ? "-" : newMarket.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
          <p className={`${ammInfo.fsl > newFsl ? "text-red-600" : ammInfo.fsl == newFsl ? "" : "text-green-600"} font-acme text-[20px]`}>{ ammInfo.fsl == newFsl ? "-" : newFsl.toLocaleString('en-US', { maximumFractionDigits: 2 }) }</p>
          <p className={`${ammInfo.psl > newPsl ? "text-red-600" : ammInfo.psl == newPsl ? "" : "text-green-600"} font-acme text-[20px]`}>{ ammInfo.psl == newPsl ? "-" : newPsl.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
        </div>
      </div>
      <div className="flex flex-row w-[40%] px-3 justify-between mr-3 rounded-xl border-2 border-black mt-2 bg-white">
        <RightAmmBoxText />
        <RightAmmBoxCurNums supply={ammInfo.supply} />
        <div className="flex flex-col items-end justify-between w-[30%]">
          <p className={`${ammInfo.supply > newSupply ? "text-red-600" : ammInfo.supply == newSupply ? "" : "text-green-600"} font-acme text-[20px]`}>{ ammInfo.supply == newSupply ? "-" : newSupply.toLocaleString('en-US', { maximumFractionDigits: 2 }) }</p>
          <p className="font-acme text-[20px]">{ ammInfo.targetRatio > 0 ? formatAsPercentage.format(ammInfo.targetRatio) : "-" }</p>
          <p className="font-acme text-[20px] whitespace-nowrap">{useFormatDate(ammInfo.lastFloorRaise * Math.pow(10, 21))}</p>
        </div> */}
      </div>
    </div>
  )
}