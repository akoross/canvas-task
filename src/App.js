import './App.css';
import Button from '@mui/material/Button';
import Canvas from './components/Canvas';
import { Stack } from '@mui/material';

function App() {
  return (
    <Stack
      direction='column'
      justifyContent='center'
      alignItems='center'
      spacing={2}
    >
      <Canvas />
      <Button variant='outlined' color='error'>
        Collapse lines
      </Button>
    </Stack>
  );
}

export default App;
