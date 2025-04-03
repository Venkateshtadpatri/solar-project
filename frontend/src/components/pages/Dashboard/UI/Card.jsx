/* eslint-disable react/prop-types */


/**
 * A Card component that displays a given title, value, and unit.
 *
 * @param {String} title - The title of the card.
 * @param {Number} value - The value to be displayed on the card.
 * @param {String} unit - The unit of measurement associated with the value.
 * @param {String} color - The background color of the card.
 *
 * @returns {JSX.Element} A JSX element representing the Card component.
 */
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
