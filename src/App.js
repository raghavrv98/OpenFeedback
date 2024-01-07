import React from "react";
import "./App.css";
import Home from "./HomePage/home";
import { Route, Routes } from "react-router-dom";
import Welcome from "./WelcomePage/welcome";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/dashboard" element={<Home />} />
      </Routes>
    </>
  );
};
export default App;
