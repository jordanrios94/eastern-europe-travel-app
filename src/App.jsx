import { useState } from 'react';
import { itinerary } from './data/itinerary.js';
import Calendar from './components/Calendar.jsx';
import DayCard from './components/DayCard.jsx';
import RouteBar from './components/RouteBar.jsx';
import './App.css';

function App() {
  const [selectedDay, setSelectedDay] = useState(null);

  const handleDayClick = (day) => {
    setSelectedDay(day);
  };

  const handleClose = () => {
    setSelectedDay(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">🗺️ Eastern Europe Trip 2026</h1>
        <p className="app-subtitle">15–28 June · Bulgaria · Romania · Ukraine · Moldova</p>
      </header>

      <RouteBar />

      <main className="app-main">
        <Calendar
          itinerary={itinerary}
          selectedDay={selectedDay}
          onDayClick={handleDayClick}
        />
      </main>

      {selectedDay && (
        <DayCard day={selectedDay} onClose={handleClose} />
      )}
    </div>
  );
}

export default App;
