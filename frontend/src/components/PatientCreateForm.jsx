import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 500 },
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: "90vh",
  overflowY: "auto",
};

const healthPlans = ["HAPVIDA", "IPASGO", "Particular", "Outro"];
const BASE_API_URL = import.meta.env.VITE_API_URL;

const PatientCreateForm = ({ onClose, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    planoSaude: "Particular",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name || !formData.planoSaude) {
      setError("O nome e o plano de saúde são obrigatórios.");
      setLoading(false);
      return;
    }

    const dataToSend = {
      ...formData,
      name: formData.name.toUpperCase(),
    };

    try {
      // Chamada de API para o seu backend Node.js (POST /api/patients)
      // const response = await fetch(`${BASE_API_URL}/api/patients`, {
      const response = await fetch(`/api/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao salvar paciente.");
      }

      const newPatient = await response.json();
      onSaveSuccess(newPatient);
      onClose();
    } catch (err) {
      setError(
        err.message ||
          "Erro de conexão com o servidor. Verifique se o backend está ativo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" component="h2" gutterBottom>
        Novo Registro de Paciente
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            required
            label="Nome Completo"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            size="small"
            autoFocus
            slotProps={{
              input: {
                style: { textTransform: "uppercase" },
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Telefone (Opcional)"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            margin="normal"
            size="small"
            placeholder="(DD) 9 XXXX-XXXX"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            select
            fullWidth
            required
            label="Plano de Saúde"
            name="planoSaude"
            value={formData.planoSaude}
            onChange={handleChange}
            margin="normal"
            size="small"
          >
            {healthPlans.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar Paciente"}
        </Button>
      </Box>
    </Box>
  );
};

export default PatientCreateForm;
