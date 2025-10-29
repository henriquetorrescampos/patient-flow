import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Modal,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PatientSelector from "./PatientSelector";
import AreaChecklist from "./AreaChecklist";
import PatientCreateForm from "./PatientCreateForm";

const AREA_TYPES = ["PSICOPEDAGOGIA", "FONO", "PSICO", "TO"];
const BASE_API_URL = import.meta.env.VITE_API_URL;

function PatientCard() {
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [errorPatients, setErrorPatients] = useState(null);

  // --- 1. FUNÇÃO DE BUSCA DE DADOS (GET) ---

  const fetchPatientData = async (patientId) => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_API_URL}/api/patients/${patientId}`);

      if (!response.ok) {
        throw new Error("Falha ao carregar dados do paciente.");
      }

      const data = await response.json();
      setPatientData(data);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Não foi possível carregar os dados do paciente.");
      setPatientData(null); // Limpa dados em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    setLoadingPatients(true);
    setErrorPatients(null);
    try {
      const response = await fetch(`${BASE_API_URL}/api/patients`);
      if (!response.ok) throw new Error("Erro ao carregar pacientes");
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      console.error(err);
      setErrorPatients("Não foi possível carregar a lista de pacientes.");
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Efeito para carregar dados quando o paciente muda
  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientData(selectedPatientId);
    } else {
      setPatientData(null);
    }
  }, [selectedPatientId]);

  // --- 2. FUNÇÃO DE ATUALIZAÇÃO DO CHECKBOX (PATCH) ---
  const handleCheckboxToggle = async (areaType, checkboxNumber, isChecked) => {
    if (!patientData) return;

    // 1. Atualização Otimista: Atualiza o estado da UI ANTES da resposta da API
    const now = new Date();
    const tempCheckboxes = patientData.checkboxes.filter(
      (c) => !(c.area === areaType && c.checkboxNumber === checkboxNumber)
    );

    // Novo checkbox que será enviado e usado para atualizar o estado local
    const newCheckboxState = {
      patientId: patientData.id,
      area: areaType,
      checkboxNumber: checkboxNumber,
      isChecked: isChecked,
      checkedDate: isChecked ? now.toISOString() : null,
    };

    // Atualiza o estado local (UI)
    setPatientData((prevData) => ({
      ...prevData,
      checkboxes: isChecked
        ? [...tempCheckboxes, newCheckboxState] // Adiciona o novo se marcado
        : tempCheckboxes, // Remove o anterior se desmarcado
    }));

    // 2. Chamada à API (PATCH)
    try {
      const response = await fetch(
        `${BASE_API_URL}/api/patients/${patientData.id}/checkboxes`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            area: areaType,
            checkboxNumber: checkboxNumber,
            isChecked: isChecked,
          }),
        }
      );

      if (!response.ok) {
        // Se a API falhar, revertemos o estado local
        throw new Error("Falha ao salvar a alteração no servidor.");
      }

      // Se a resposta for bem-sucedida, não fazemos nada, pois a atualização otimista já foi feita.
    } catch (apiError) {
      console.error("Falha ao persistir o checkbox:", apiError);
      setError("Erro ao salvar a alteração. Revertendo...");

      // REVERTER O ESTADO: Recarrega os dados do servidor para obter a fonte da verdade
      // (Isso é uma forma segura de lidar com falhas de atualização otimista)
      await fetchPatientData(patientData.id);
    }
  };

  const handleSaveSuccess = (newPatient) => {
    setPatients((prev) => [...prev, newPatient]); // adiciona à lista
    setSelectedPatientId(newPatient.id); // seleciona o paciente
    setOpenModal(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Registro de Atendimentos 📋
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon></AddIcon>}
        sx={{
          my: 2,
          borderRadius: 8,
          fontWeight: "bold",
        }}
        onClick={() => setOpenModal(true)}
      >
        Adicionar Paciente
      </Button>
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <PatientCreateForm
          onClose={() => setOpenModal(false)}
          onSaveSuccess={handleSaveSuccess}
        />
      </Modal>

      {/* O PatientSelector deve receber a lista de pacientes. 
          Você precisará de uma função GET /api/patients para carregar a lista de pacientes disponíveis. */}
      <PatientSelector
        selectedPatientId={selectedPatientId}
        onPatientChange={setSelectedPatientId}
        patients={patients}
        loading={loadingPatients}
        error={errorPatients}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Carregando...</Typography>
        </Box>
      )}

      {patientData && !loading && (
        <Grid container spacing={3}>
          {AREA_TYPES.map((areaType) => (
            <Grid item xs={12} sm={6} md={3} key={areaType}>
              <AreaChecklist
                areaType={areaType}
                // Passa apenas os checkboxes pertinentes para a área
                checkboxes={patientData.checkboxes.filter(
                  (c) => c.area === areaType
                )}
                onCheckboxToggle={handleCheckboxToggle}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {!selectedPatientId && !loading && (
        <Alert severity="info">
          Selecione um paciente para ver os registros.
        </Alert>
      )}
    </Box>
  );
}

export default PatientCard;
