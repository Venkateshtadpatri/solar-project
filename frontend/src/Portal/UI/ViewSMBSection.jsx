/* eslint-disable react/prop-types */
import { useEffect } from "react";

/**
 * Renders a section for a single SMB in the solar panel monitoring view.
 * The section includes the SMB's image, name, and a grid of its strings.
 * Each string is displayed as a colored box with its power output in kW.
 * The box's color is determined by the string's voltage.
 * The grid is divided into columns based on the number of panels per string.
 * The component also renders a grid of panels for each string.
 *
 * @param {number} smbIndex The index of the current SMB (0-indexed).
 * @param {number} StringCount The number of strings in the current SMB.
 * @param {number} PanelCount The number of panels in each string.
 * @param {Array.<Object>} powerData The power data for the current SMB.
 * @returns {React.ReactElement} The rendered React component.
 */
const ViewSMBSection = ({ smbIndex, StringCount, PanelCount, powerData }) => {
  // Transform the power data to include only the current SMB's strings
  const PowerDataArray = Array.isArray(powerData)
  ? powerData
      .find((smb) => `${smb.smb_id}` === `${smbIndex + 1}`)?.strings || []
      .map((item) => ({
        string_id: item.string_id,
        voltage: item.voltage || 0,
        power: item.power_output || 0,
      }))
  : [];


  useEffect(() => {
    const timer = setTimeout(() => {
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!powerData || Object.keys(powerData).length === 0) {
    return null; // or render a placeholder
  }


  // Define the range of strings to display for the current SMB
  const currentSMBData = PowerDataArray.slice(0, StringCount);


  /**
   * Returns a tailwindcss background color class based on the given voltage.
   *
   * - If the voltage is less than 900, it returns "bg-red-600".
   * - If the voltage is between 900 and 1000, it returns "bg-orange-400".
   * - If the voltage is between 1000 and 1300, it returns "bg-green-500".
   * - Otherwise, it returns "solar-bg-color".
   *
   * @param {number} voltage The voltage to determine the color for.
   * @returns {string} The tailwindcss background color class.
   */
  const getColor = (voltage) => {
    if (voltage < 900) return "bg-red-600";
    if (voltage >= 900 && voltage <= 1000) return "bg-orange-400";
    if (voltage > 1000 && voltage <= 1300) return "bg-green-500";
    return "solar-bg-color";
  };

  return (

    <div key={smbIndex} className="flex justify-center items-center mt-32">
      <div className="w-[1270px] h-[103px] mr-[10px] flex items-center justify-center rounded-full">
        <img
          src="/smb-image.png"
          alt={`SMB Image ${smbIndex + 1}`}
          draggable={false}
        />
        <div className="bg-white text-black font-bold w-[90px] h-[25px] -ml-[110px] mt-[150px] text-center">
          SMB {smbIndex + 1}
        </div>
      </div>
      <div className={`grid grid-cols-${PanelCount} gap-y-8`}>
        {currentSMBData.map((stringData, stringIndex) => (
          <div key={stringIndex} className="flex items-center">
            <div
              className={`${getColor(stringData.voltage)} text-white text-md font-bold rounded-md flex flex-col items-center justify-center p-1 w-[100px] h-[30px] mr-2`}
            >
              <div className="w-[150px] text-center flex justify-center flex-col">
                <p>{stringData.power_output} kW</p>
              </div>
            </div>
            <div className="flex solar-grid-overlay">
              {Array.from({ length: PanelCount }).map((_, panelIndex) => (
                <div
                  key={panelIndex}
                  className="w-[82px] h-[100px] border-2 border-black dark:border-white relative solar-bg-color"
                >
                  <div className="bg-black dark:bg-white text-white dark:text-black font-bold w-[75px] h-[25px] absolute -bottom-[28px] left-[50%] transform -translate-x-1/2 text-center">
                    {smbIndex + 1}.{stringIndex + 1}.{panelIndex + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewSMBSection;
