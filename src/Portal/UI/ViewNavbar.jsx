import ThemeToggleButton from "./ThemeToggleButton";

/* eslint-disable react/prop-types */
const ViewNavbar = ({ Plants, SelectedPlantId, setSelectedPlantId, SmbCount, StringCount, PanelCount }) => {
    return (
        <header className="w-full h-[75px] bg-[#1e3a8a] sticky top-0 z-50">
            <div className="flex items-center ml-5 pt-4">
                <form className="flex items-center">
                    <label htmlFor="Plant_ID" className="font-bold text-lg mr-3 -mt-[20px] text-white">Plant ID:</label>
                    <div className="relative w-[200px] mb-5">
                        <select
                            name="Plant_ID"
                            value={SelectedPlantId}
                            id="Plant_ID"
                            aria-label="Plant ID"
                            required
                            className="w-full font-semibold px-4 py-2 pr-10 rounded-xl  text-black bg-white accent-blue-900 border border-gray-300 focus:outline-none focus:ring-2 focus:bg-white cursor-pointer appearance-none"
                            onChange={(e) => setSelectedPlantId(e.target.value)} // Update the state in parent
                        >
                            <option value="" disabled className="text-gray-40 bg-blue-900 hover:bg-blue-700">
                                Select Plant ID
                            </option>
                            {Plants.map((plant) => (
                                <option key={plant.Plant_ID} value={plant.Plant_ID} className="bg-blue-900 hover:bg-blue-700 text-white">
                                    {plant.Plant_ID}
                                </option>
                            ))}
                        </select>
                        {/* Custom arrow icon for the dropdown */}
                        <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="w-4 h-4 text-gray-600"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>
                    </div>
                </form>
                {
                    SelectedPlantId == "" ?
                    <>
                    </>
                    :
                    <div className="flex items-center ml-10 -mt-2 gap-10">
                    <label htmlFor="SMBCount" className="font-medium text-lg text-white">SMB Count:</label>
                    <input 
                        id="SMBCount" 
                        name="SMBCount" 
                        className="ml-2 w-20 font-medium text-sm px-2 py-1 rounded-md" 
                        value={SmbCount} 
                        type="text" 
                        disabled 
                    />
                    <label htmlFor="StringCount" className="font-medium text-lg text-white">String Count:</label>
                    <input 
                        id="StringCount" 
                        name="StringCount" 
                        className="ml-2 w-20 font-medium text-sm px-2 py-1 rounded-md" 
                        value={StringCount} 
                        type="text" 
                        disabled 
                    />
                    <label htmlFor="PanelCount" className="font-medium text-lg text-white">Module Count:</label>
                    <input 
                        id="PanelCount" 
                        name="PanelCount" 
                        className="ml-2 w-20 font-medium text-sm px-2 py-1 rounded-md" 
                        value={PanelCount} 
                        type="text" 
                        disabled 
                    />
                </div>

                }
            </div>
            <ThemeToggleButton />
        </header>
    );
};

export default ViewNavbar;