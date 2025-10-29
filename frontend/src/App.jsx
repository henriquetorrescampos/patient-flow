import PatientCard from './components/PatientCard'; 
import { Container } from '@mui/material';
import './App.css' // Mantenha o CSS se necessário

function App() {
  return (
    // Utilize o Container do MUI para dar um padding e centralizar o conteúdo
    <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
        {/* 3. Renderize seu componente principal */}
        <PatientCard />
    </Container>
  )
}

export default App