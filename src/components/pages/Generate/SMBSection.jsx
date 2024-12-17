/* eslint-disable react/prop-types */

const SMBSection = ({ smbIndex, StringCount, PanelCount }) => {
    
    return (
        <div key={smbIndex} className="flex justify-center items-center mt-32">
            {/* SMB Image Section */}
            <div className="w-[1270px] h-[103px] mr-[150px] flex items-center justify-center rounded-full">
                <img
                    src="/smb-image.png"
                    alt={`SMB Image ${smbIndex + 1}`}
                    loading="lazy"
                    className="absolute"
                    draggable={false}
                />
                <div className="bg-white text-black font-bold w-[90px] h-[25px] -ml-[10px] mt-[150px] text-center ">
                    SMB {smbIndex + 1}
                </div>
            </div>

            {/* Solar Panel Grid Section with Grid Overlay */}
            <div className={`grid grid-cols-${PanelCount} gap-y-8`}> {/* Change to grid-cols-30 to display 30 panels in one row */}
                {Array.from({ length: StringCount }).map((_, stringIndex) => (
                    <div
                        key={stringIndex}
                        className="flex solar-grid-overlay"  // Removed flex-wrap
                    >
                        {Array.from({ length: PanelCount }).map((_, panelIndex) => (
                            <div
                                key={panelIndex}
                                className="w-[82px] h-[110px] solar-bg-color border-2 border-white relative"  // Add 'relative' here
                            >
                                {/* Panel Representation */}
                                {/* Label Representation */}
                                <div className="bg-white text-black font-bold w-[75px] h-[25px] absolute -bottom-[28px] left-1/2 transform -translate-x-1/2 border-2 border-black text-center z-40">
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
