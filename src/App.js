import React from "react";
import { Route, Routes } from "react-router-dom";
// import Welcome from "./WelcomePage/welcome";
import Login from "./HomePage/Login";
import User from "./HomePage/User";
import OrganisationHome from "./HomePage/OraganisationHome";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<User />} />
        <Route path="/login" element={<Login />} />
        <Route path="/organisationHome" element={<OrganisationHome />} />
      </Routes>
    </>
  );
};
export default App;
