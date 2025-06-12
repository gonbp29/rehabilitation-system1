import React, { useState } from 'react';

const demoEquipmentTypes = [
  'קביים',
  'הליכון',
  'כיסא גלגלים',
  'מכשיר פיזיותרפיה',
  'מדרגה',
  'כדור פיזיו',
];

interface EquipmentStatus {
  available: boolean;
  quantity: number;
}

interface Branch {
  id: number;
  name: string;
  address: string;
  equipment: { [key: string]: EquipmentStatus };
}

const demoBranches: Branch[] = [
  {
    id: 1,
    name: 'יד שרה תל אביב',
    address: 'רחוב החשמונאים 90, תל אביב',
    equipment: {
      'קביים': { available: true, quantity: 3 },
      'הליכון': { available: false, quantity: 0 },
      'כיסא גלגלים': { available: true, quantity: 1 },
      'מכשיר פיזיותרפיה': { available: false, quantity: 0 },
      'מדרגה': { available: true, quantity: 2 },
      'כדור פיזיו': { available: false, quantity: 0 },
    },
  },
  {
    id: 2,
    name: 'יד שרה ירושלים',
    address: 'רחוב ירמיהו 33, ירושלים',
    equipment: {
      'קביים': { available: true, quantity: 5 },
      'הליכון': { available: true, quantity: 2 },
      'כיסא גלגלים': { available: false, quantity: 0 },
      'מכשיר פיזיותרפיה': { available: true, quantity: 1 },
      'מדרגה': { available: false, quantity: 0 },
      'כדור פיזיו': { available: true, quantity: 3 },
    },
  },
  {
    id: 3,
    name: 'יד שרה נתניה',
    address: 'רחוב הרצל 10, נתניה',
    equipment: {
      'קביים': { available: false, quantity: 0 },
      'הליכון': { available: true, quantity: 1 },
      'כיסא גלגלים': { available: true, quantity: 2 },
      'מכשיר פיזיותרפיה': { available: false, quantity: 0 },
      'מדרגה': { available: true, quantity: 1 },
      'כדור פיזיו': { available: false, quantity: 0 },
    },
  },
  {
    id: 4,
    name: 'יד שרה חדרה',
    address: 'רחוב הנשיא 5, חדרה',
    equipment: {
      'קביים': { available: false, quantity: 0 },
      'הליכון': { available: true, quantity: 2 },
      'כיסא גלגלים': { available: false, quantity: 0 },
      'מכשיר פיזיותרפיה': { available: true, quantity: 1 },
      'מדרגה': { available: false, quantity: 0 },
      'כדור פיזיו': { available: true, quantity: 2 },
    },
  },
  {
    id: 5,
    name: 'יד שרה אילת',
    address: 'שדרות התמרים 15, אילת',
    equipment: {
      'קביים': { available: true, quantity: 1 },
      'הליכון': { available: false, quantity: 0 },
      'כיסא גלגלים': { available: false, quantity: 0 },
      'מכשיר פיזיותרפיה': { available: true, quantity: 1 },
      'מדרגה': { available: false, quantity: 0 },
      'כדור פיזיו': { available: true, quantity: 1 },
    },
  },
  {
    id: 6,
    name: 'יד שרה באר שבע',
    address: 'רחוב העצמאות 20, באר שבע',
    equipment: {
      'קביים': { available: false, quantity: 0 },
      'הליכון': { available: true, quantity: 1 },
      'כיסא גלגלים': { available: true, quantity: 1 },
      'מכשיר פיזיותרפיה': { available: false, quantity: 0 },
      'מדרגה': { available: true, quantity: 2 },
      'כדור פיזיו': { available: false, quantity: 0 },
    },
  },
];

const PatientEquipmentLoan: React.FC = () => {
  const [selectedType, setSelectedType] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!selectedType) return;
    // סינון דמו
    const filtered = demoBranches
      .map(branch => ({
        ...branch,
        equipmentStatus: branch.equipment[selectedType] || { available: false, quantity: 0 },
      }))
      .filter(branch => branch.equipment[selectedType]);
    setResults(filtered);
    setSearched(true);
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #eee', padding: 24 }}>
      <h1 style={{ textAlign: 'center' }}>השאלת ציוד רפואי (יד שרה)</h1>
      <div style={{ margin: '1.5rem 0', display: 'flex', gap: 12 }}>
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #ccc' }}
        >
          <option value="">בחר סוג ציוד...</option>
          {demoEquipmentTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <button onClick={handleSearch} style={{ padding: '8px 18px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600 }}>
          חפש ציוד
        </button>
      </div>
      {searched && (
        <div>
          {results.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888' }}>לא נמצאו סניפים עם הציוד המבוקש.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead>
                <tr style={{ background: '#f7f7fa' }}>
                  <th>סניף</th>
                  <th>כתובת</th>
                  <th>זמינות</th>
                  <th>כמות</th>
                </tr>
              </thead>
              <tbody>
                {results.map(branch => (
                  <tr key={branch.id} style={{ textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    <td>{branch.name}</td>
                    <td>{branch.address}</td>
                    <td>
                      {branch.equipmentStatus.available
                        ? <span style={{ color: 'green', fontWeight: 600 }}>במלאי</span>
                        : <span style={{ color: 'red', fontWeight: 600 }}>אזל</span>
                      }
                    </td>
                    <td>{branch.equipmentStatus.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientEquipmentLoan; 