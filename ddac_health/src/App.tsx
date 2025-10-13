import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + '/hello')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">DDAC-Health React 前端</h1>
      <p>后端返回数据: {data ? JSON.stringify(data) : '加载中...'}</p>
    </div>
  );
}

export default App;