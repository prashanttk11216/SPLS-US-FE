import React from "react";
import "./Loading.scss";

const Loading: React.FC = () => {
  return (
    <div className="loading">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="obj"></div>
      ))}
    </div>
  );
};

export default Loading;
