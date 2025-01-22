/* eslint-disable react/prop-types */
import { useEffect } from "react";

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
            <div className="flex solar-grid-overlay ">
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
