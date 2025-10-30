import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";

function PatientSelector({
  selectedPatientId,
  onPatientChange,
  patients,
  loading,
  error,
}) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <CircularProgress size={20} />
        <span style={{ marginLeft: 8 }}>Carregando Pacientes...</span>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 4 }}>
        {error}
      </Alert>
    );
  }

  return (
    <FormControl fullWidth sx={{ my: 2 }}>
      <InputLabel id="patient-select-label">Selecione o Paciente</InputLabel>
      <Select
        labelId="patient-select-label"
        value={selectedPatientId || ""}
        label="Selecione o Paciente"
        onChange={(e) => onPatientChange(e.target.value)}
      >
        {patients.length > 0 ? (
          patients.map((patient) => (
            <MenuItem key={patient.id} value={patient.id}>
              {patient.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>Nenhum paciente encontrado</MenuItem>
        )}
      </Select>
    </FormControl>
  );
}

export default PatientSelector;
