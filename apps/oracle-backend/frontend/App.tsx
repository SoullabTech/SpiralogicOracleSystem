import { useState, useCallback } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState<number>(0);  // Type is already set for count

  const incrementCount = useCallback(() => {
    setCount((prevCount) => prevCount + 1);
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Welcome to the Vite + React App</h1>
      </header>

      <main>
        <div className="counter-card">
          <button 
            onClick={incrementCount} 
            className="increment-button" 
            aria-label="Increment count"  // Added aria-label for accessibility
          >
            Count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test Hot Module Replacement (HMR)
          </p>
        </div>

        <footer>
          <p>
            Click on the Vite and React logos to learn more.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
