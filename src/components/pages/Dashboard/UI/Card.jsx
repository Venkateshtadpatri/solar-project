import React from 'react';

const Card = ({ title, value, unit,color }) => {
  return (
    <div style={{backgroundColor: color}} className="bg-white shadow-md rounded-lg p-4 w-72 h-32 flex justify-center flex-col items-center text-center mx-1 transform transition-transform duration-200 hover:scale-105 hover:shadow-lg">
      <h3 className="text-white md:text-xl font-bold">{title}</h3>
      <p className="text-3xl text-white font-semibold">
        {value} <span className="text-lg text-white">{unit}</span>
      </p>
    </div>
  );
};

export default Card;
