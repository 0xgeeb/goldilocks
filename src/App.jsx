import React from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import "./index.css"
import Nav from "./components/Nav.jsx"
import Home from "./pages/Home.jsx"
import Amm from "./pages/Amm.jsx"
import Staking from "./pages/Staking.jsx"
import Borrowing from "./pages/Borrowing.jsx"

export default function App() {

  return (
    <Router>
      <div className="flex flex-col relative min-w-screen min-h-screen m-0 p-0 overflow-x-hidden bg-[#F7F7F7]">
        <Nav />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/amm" element={<Amm />} />
          <Route exact path="/staking" element={<Staking />} />
          <Route exact path="/borrowing" element={<Borrowing />} />
        </Routes>
      </div>
    </Router>
  )
}