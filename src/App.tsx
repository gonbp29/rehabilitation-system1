import { useState } from 'react'
import './App.css'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <div className="navbar-left">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="menu-button"
              >
                <svg className="menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="navbar-title">מערכת שיקום</span>
            </div>
            <div className="navbar-right">
              <button className="btn">התחברות</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="main-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? '' : 'hidden'}`}>
          <div className="sidebar-content">
            <nav>
              <a href="#" className="nav-link active">דף הבית</a>
              <a href="#" className="nav-link">פגישות</a>
              <a href="#" className="nav-link">תרגילים</a>
              <a href="#" className="nav-link">דוחות</a>
              <a href="#" className="nav-link">הגדרות</a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="cards-grid">
            {/* Stats Card */}
            <div className="card">
              <h3>סטטיסטיקות</h3>
              <div className="stats-content">
                <span>תרגילים שהושלמו</span>
                <span className="stats-number">12</span>
              </div>
            </div>

            {/* Appointments Card */}
            <div className="card">
              <h3>פגישות קרובות</h3>
              <div className="appointments-list">
                <div className="appointment-item">
                  <span>פיזיותרפיה</span>
                  <span className="appointment-time">מחר, 10:00</span>
                </div>
                <div className="appointment-item">
                  <span>הידרותרפיה</span>
                  <span className="appointment-time">יום ג׳, 15:30</span>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="card">
              <h3>התקדמות</h3>
              <div className="progress-container">
                <div className="progress-header">
                  <span className="progress-status">בתהליך</span>
                  <span className="progress-percentage">75%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="card activities-card">
            <h3>פעילות אחרונה</h3>
            <div className="activities-list">
              <div className="activity-item">
                <div className="activity-dot success"></div>
                <div>
                  <p>השלמת תרגיל חיזוק שרירי הרגליים</p>
                  <p className="activity-time">לפני שעתיים</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-dot info"></div>
                <div>
                  <p>נקבעה פגישה חדשה</p>
                  <p className="activity-time">היום, 09:30</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
