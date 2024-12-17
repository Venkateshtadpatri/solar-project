/* eslint-disable react/prop-types */
const ViewNavbar = ({ Plants, SelectedPlantId, setSelectedPlantId }) => {
  return (
      <header className="w-full h-[75px] bg-red-400 sticky top-0 z-50">
          <div className="flex items-center ml-5 pt-4">
              <form className="flex items-center">
                  <label htmlFor="Plant_ID" className="font-bold text-lg mr-3">Plant ID:</label>
                  <div className="relative w-[200px]">
                      <select
                          name="Plant_ID"
                          value={SelectedPlantId}
                          id="Plant_ID"
                          required
                          className="w-full font-semibold px-4 py-2 pr-10 rounded-xl text-gray-800 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white cursor-pointer appearance-none"
                          onChange={(e) => setSelectedPlantId(e.target.value)} // Update the state in parent
                      >
                          <option value="" disabled className="text-gray-40">
                              Select Plant ID
                          </option>
                          {Plants.map((plant) => (
                              <option key={plant.Plant_ID} value={plant.Plant_ID}>
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
          </div>
      </header>
  );
};

export default ViewNavbar;
