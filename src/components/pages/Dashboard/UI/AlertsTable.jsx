import React from 'react';
import { ColorAlertIcon } from '../../../icons/icons';

const alertsData = [
  { id: 'SMB001', fault: 'Dust', severity: 'Warning' },
  { id: 'SMB006', fault: 'Bird waste', severity: 'Warning' },
  { id: 'SMB012', fault: 'Crack', severity: 'Critical' },
  { id: 'SMB019', fault: 'Crack', severity: 'Critical' },
  { id: 'SMB013', fault: 'Dust', severity: 'Warning' },
  { id: 'SMB043', fault: 'Bird waste', severity: 'Warning' },
  { id: 'SMB001', fault: 'Dust', severity: 'Warning' },
  { id: 'SMB006', fault: 'Bird waste', severity: 'Warning' },
  { id: 'SMB012', fault: 'Crack', severity: 'Critical' },
  { id: 'SMB019', fault: 'Crack', severity: 'Critical' },
  { id: 'SMB013', fault: 'Dust', severity: 'Warning' },
  { id: 'SMB043', fault: 'Bird waste', severity: 'Warning' }
];

const AlertsTable = () => {
  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-300 shadow-md rounded-2xl p-4" style={{ height: '450px', width: '390px' }}>
      <div className="text-2xl mb-2 font-semibold flex items-center">
        <img src={ColorAlertIcon} alt="Alert icon" className="w-12 h-12 mr-4" />
        <h3 className="mt-[20px] text-3xl">Alerts</h3>
      </div>
      <div>
        <table className="w-full text-left table-fixed">
          <thead className="sticky top-0 bg-blue-900 text-white">
            <tr>
              <th className="ml-4 p-2 rounded-tl-md">SMB ID</th>
              <th className="ml-10 p-2">Fault Name</th>
              <th className="ml-10 p-2 rounded-tr-md">Severity Level</th>
            </tr>
          </thead>
        </table>
      </div>
      {/* Scrollable table */}
      <div className="overflow-y-auto" style={{ maxHeight: '290px' }}>
        <table className="w-full text-center">
          <tbody>
            {alertsData.map((alert, index) => (
              <tr key={index} className="bg-white">
                <td className="border-b font-bold border-gray-900 py-2 text-sm">{alert.id}</td>
                <td className="border-b border-gray-900 py-2 text-sm font-bold">{alert.fault}</td>
                <td className="border-b border-black py-2">
                  <div
                    className={`w-20 p-1 rounded-xl mx-auto font-bold text-sm ${alert.severity === 'Critical' ? 'bg-red-100 border-2 border-red-500' : 'bg-yellow-100 border-2 border-yellow-500'}`}
                  >
                    {alert.severity}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertsTable;
