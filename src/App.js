import React from 'react';
import './App.css';
import useFetch from './useFetch'

const App = () => {
  const [data, loading, error] = useFetch('https://api.etilbudsavis.dk/v2/dealerfront?country_id=DK')

  if (loading) return 'Loading...'

  return (
    <div className="App">
      <header className="App-header">
        <code style={{ display: 'block' }}>
          <pre>{JSON.stringify(data[0], null, 2)}</pre>
        </code>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"

        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
