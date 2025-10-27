import React from "react";
import { Route, Routes } from "react-router-dom";
import Entry from "./Entry";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Entry />} />
    </Routes>
  );
};

export default Router;
