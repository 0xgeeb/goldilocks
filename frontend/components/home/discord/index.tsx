export const Discord = () => {
  return (
    <div className="w-screen h-screen relative" id="reverse-page-div">
      <img
        className="absolute right-0 bottom-0"
        src="/astronaut.png"
        alt="astronaut"
      />
      <div className="absolute top-[30%] left-[15%] flex flex-col justify-center items-center">
        <h1 className="font-acme text-[4rem]">join us on discord</h1>
        <a
          target="_blank"
          href="https://discord.gg/3cdn88Mbq8"
        >
          <img
            className="w-[100px] h-[100px] mt-10 cursor-pointer hover:opacity-50"
            src="/discord.png"
            alt="discord"
            id="discord"
          />
        </a>
      </div>
    </div>
  )
}