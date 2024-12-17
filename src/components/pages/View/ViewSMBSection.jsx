
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { ClipLoader } from 'react-spinners';

const ViewSMBSection = ({ smbIndex, StringCount, PanelCount, powerData }) => {
  // Ensure `powerData` is an array and map its structure
  const PowerDataArray = Array.isArray(powerData?.data)
    ? powerData.data.map((item) => ({
        voltage: item.voltage || 0, // Default to 0 if voltage is missing
        power: item.power_output || 0, // Default to 0 if power is missing
      }))
    : [];
  const [loading, setLoading] = useState(true);

  // Simulate a 3-second delay before displaying the content
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    },5000);
       return () => clearTimeout(timer);
  }, []);

  // Calculate the data slice for the current SMB based on `smbIndex` and `StringCount`
  const startIndex = smbIndex * StringCount;
  const endIndex = startIndex + StringCount;
  const currentSMBData = PowerDataArray.slice(startIndex, endIndex);

  console.log("Current SMB Data:", currentSMBData);

  // Function to determine the color based on voltage
  const getColor = (voltage) => {
    if (voltage < 900) return "bg-red-600";
    if (voltage >= 900 && voltage <= 1000) return "bg-yellow-400";
    if (voltage > 1000 && voltage <= 1300) return "bg-green-500";
    return "solar-bg-color"; // Default color
  };

  return (
    loading ? (
      <div className="flex justify-center items-center absolute">
        <ClipLoader size={50} color={"#FFF"} loading={loading} />
      </div>
    ) : (
      <div key={smbIndex} className="flex gap-8 justify-center items-center mt-32">
        {/* SMB Image Section */}
        <div className="w-[127px] h-[103px] mr-[100px] flex items-center justify-center rounded-full">
          <img
            src="/smb-image.png"
            alt={`SMB Image ${smbIndex + 1}`}
            draggable={false}
          />
          <div className="bg-white text-black font-bold w-[90px] h-[25px] -ml-[110px] mt-[150px] text-center">
            SMB {smbIndex + 1}
          </div>
        </div>

        {/* Solar Panel Grid Section with Grid Overlay */}
        <div className={`grid grid-cols-${PanelCount} gap-y-8`}>
          {currentSMBData.map((stringData, stringIndex) => (
            <div key={stringIndex} className="flex items-center">
              {/* Power Display for each String */}
              <div
                className={`${getColor(stringData.voltage)} text-white text-md font-bold rounded-md flex flex-col items-center justify-center p-1 w-[100px] h-[25px] mr-2`}
              >
                <div className="w-[100px] flex justify-center">
                  {stringData.power} kW
                </div>
              </div>

              {/* Solar Panels in the String */}
              <div className="flex solar-grid-overlay">
                {Array.from({ length: PanelCount }).map((_, panelIndex) => (
                  <div
                    key={panelIndex}
                    className="w-[82px] h-[100px] border-2 border-white relative solar-bg-color"
                  >
                    {/* Panel Representation */}
                    <div className="bg-white text-black font-bold w-[75px] h-[25px] absolute -bottom-[28px] left-[50%] transform -translate-x-1/2 text-center">
                      {smbIndex + 1}.{stringIndex + 1}.{panelIndex + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );
};

export default ViewSMBSection;
