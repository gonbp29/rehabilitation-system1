import React from 'react';
import { Link } from 'react-router-dom';

const RehabPlanList: React.FC = () => {
  const plans = JSON.parse(localStorage.getItem('rehabPlans') || '{}');
  const patientNames = Object.keys(plans);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>רשימת תוכניות שיקום</h2>
      <Link to="/create-rehab-plan" style={{ display: 'inline-block', marginBottom: 20, fontSize: 18 }}>
        + צור תוכנית חדשה
      </Link>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {patientNames.length === 0 && <li>אין תוכניות שיקום</li>}
        {patientNames.map(name => (
          <li key={name} style={{ marginBottom: 16, border: '1px solid #ccc', borderRadius: 8, padding: 16 }}>
            <strong>{name}</strong>
            <br />
            <Link to={`/rehab-plans/${encodeURIComponent(name)}`} style={{ color: '#1976d2' }}>
              לצפייה בפרטי התוכנית
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RehabPlanList; 