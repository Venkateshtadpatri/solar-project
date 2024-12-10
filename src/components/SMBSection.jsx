import React from 'react';

const SMBSection = ({ smbIndex, StringCount, PanelCount }) => {
    return (
        <div key={smbIndex} className="flex gap-8 items-center mt-32">
            {/* SMB Image Section */}
            <div className="w-[127px] h-[103px] mr-[100px] flex items-center justify-center rounded-full">
                <img
                    src="/smb-image.png"
                    alt={`SMB Image ${smbIndex + 1}`}
                    draggable={false}
                />
                <div className="bg-white text-black font-bold w-[90px] h-[25px] -ml-[110px] mt-[150px] text-center ">
                    SMB {smbIndex + 1}
                </div>
            </div>

            {/* Solar Panel Grid Section with Grid Overlay */}
            <div className="grid grid-cols-1 gap-8 overflow-visible"> {/* Add overflow-visible here */}
                {Array.from({ length: StringCount }).map((_, stringIndex) => (
                    <div
                        key={stringIndex}
                        className="flex flex-wrap solar-grid-overlay"  // Apply grid overlay to each string (row)
                    >
                        {Array.from({ length: PanelCount }).map((_, panelIndex) => (
                            <div
                                key={panelIndex}
                                className="w-[80px] h-[100px] solar-bg-color border-2 border-white relative"  // Add 'relative' here
                            >
                                {/* Panel Representation */}
                                <div className="bg-white text-black font-bold w-[75px] h-[25px] absolute -bottom-[28px] left-1/2 transform -translate-x-1/2 border-2 border-black text-center">
                                    {smbIndex + 1}.{stringIndex + 1}.{panelIndex + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SMBSection;
