import './App.scss';
import MemoApp from './components/MemoApp';
import { MemoProvider } from './context';

function App() {
  return (
    <div className="App">
      <MemoProvider>
        <MemoApp/>
      </MemoProvider>
    </div>
  );
}

export default App;
