import { HomeNav } from "../components/home"

export default function NotFound() {
  return (
    <div className="h-screen w-screen" id="page-div">
      <HomeNav />
      <h1 className="absolute left-[20%] top-[30%] font-acme text-[80px]">are you lost ser</h1>
      <div className="w-[30%]">
        <img 
          className="absolute bottom-0 right-0 w-[70%] lg:w-[40%] h-[50%]"
          src="/lost.png"
          alt="lost"
        />
      </div>
    </div>
  )
}