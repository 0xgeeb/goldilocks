import Image from "next/image"

export default function NotFound() {
  return (
    <div className="h-[100%] w-[100%] flex flex-row" id="page-div">
      <div className="w-[70%] mt-48 pl-72">
        <h1 className="font-acme text-[80px] mx-auto">are you lost ser</h1>
      </div>
      <div className="w-[30%]">
        <Image className="absolute bottom-0 right-0" width="1000" height="600" src="/lost.png" alt="lost" />
      </div>
    </div>
  )
}