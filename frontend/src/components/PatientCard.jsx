import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Modal,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PatientSelector from "./PatientSelector";
import AreaChecklist from "./AreaChecklist";
import PatientCreateForm from "./PatientCreateForm";
import HistoryList from "./HistoryList";
import { saveAreaHistory } from "../../../backend/service/historyService";

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
  const [savingArea, setSavingArea] = useState(null); // <-- Adicionado
  const [successMessage, setSuccessMessage] = useState(""); // <-- Adicionado
  const [refreshHistory, setRefreshHistory] = useState(0); // <-- Adicionado

  // --- FUNÇÃO PARA ALTERAR A DATA DO CHECKBOX ---
  const handleDateChange = async (area, checkboxNumber, newDate) => {
    if (!patientData) return;

    // Atualização otimista do estado local
    setPatientData((prevData) => ({
      ...prevData,
      checkboxes: prevData.checkboxes.map((c) =>
        c.area === area && c.checkboxNumber === checkboxNumber
          ? { ...c, checkedDate: newDate }
          : c
      ),
    }));

    try {
      const response = await fetch(
        // `/api/patients/${patientData.id}/checkboxes/date`,
        `${BASE_API_URL}/api/patients/${patientData.id}/checkboxes/date`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ area, checkboxNumber, newDate }),
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao atualizar a data no servidor.");
      }
    } catch (err) {
      console.error("Erro ao atualizar data:", err);
      setError("Erro ao salvar a alteração da data. Revertendo...");
      // Reverte carregando os dados do servidor
      await fetchPatientData(patientData.id);
    }
  };

  // --- FUNÇÃO DE BUSCA DE DADOS (GET) ---
  const fetchPatientData = async (patientId) => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      // const response = await fetch(`/api/patients/${patientId}`);
      const response = await fetch(`${BASE_API_URL}/api/patients/${patientId}`);

      if (!response.ok) {
        throw new Error("Falha ao carregar dados do paciente.");
      }

      const data = await response.json();
      setPatientData(data);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Não foi possível carregar os dados do paciente.");
      setPatientData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    setLoadingPatients(true);
    setErrorPatients(null);
    try {
      // const response = await fetch(`/api/patients`);
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

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientData(selectedPatientId);
    } else {
      setPatientData(null);
    }
  }, [selectedPatientId]);

  // --- FUNÇÃO DE ATUALIZAÇÃO DO CHECKBOX (PATCH) ---
  const handleCheckboxToggle = async (areaType, checkboxNumber, isChecked) => {
    if (!patientData) return;

    const now = new Date();
    const tempCheckboxes = patientData.checkboxes.filter(
      (c) => !(c.area === areaType && c.checkboxNumber === checkboxNumber)
    );

    const newCheckboxState = {
      patientId: patientData.id,
      area: areaType,
      checkboxNumber: checkboxNumber,
      isChecked: isChecked,
      checkedDate: isChecked ? now.toISOString() : null,
    };

    setPatientData((prevData) => ({
      ...prevData,
      checkboxes: isChecked
        ? [...tempCheckboxes, newCheckboxState]
        : tempCheckboxes,
    }));

    try {
      const response = await fetch(
        // `/api/patients/${patientData.id}/checkboxes`,
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
        throw new Error("Falha ao salvar a alteração no servidor.");
      }
    } catch (apiError) {
      console.error("Falha ao persistir o checkbox:", apiError);

      setError("Erro ao salvar a alteração. Revertendo...");

      await fetchPatientData(patientData.id);
    }
  };

  const handleSaveAreaHistory = async (areaType) => {
    if (!patientData) return;

    setSavingArea(areaType);
    setError(null);

    try {
      // Filtra apenas os checkboxes desta área
      const areaCheckboxes = patientData.checkboxes.filter(
        (c) => c.area === areaType
      );

      // Conta quantas sessões estão completas
      const sessionsCompleted = areaCheckboxes.filter(
        (c) => c.isChecked
      ).length;

      if (sessionsCompleted === 0) {
        setError("Nenhuma sessão marcada para salvar o histórico.");
        setSavingArea(null);
        return;
      }

      // 1. Salva o histórico
      await saveAreaHistory(patientData.id, areaType, areaCheckboxes);

      // 2. Após salvar, limpa os checkboxes da área (REQUER IMPLEMENTAÇÃO NO BACKEND)
      // Por enquanto, apenas recarrega os dados para mostrar o estado atual
      // Se o backend for atualizado para RESETAR os checkboxes, isso deve recarregar o novo estado vazio
      await fetchPatientData(patientData.id);

      // Mostra mensagem de sucesso
      const areaLabels = {
        FONO: "Fonoaudiologia",
        TO: "Terapia Ocupacional",
        PSICO: "Psicologia",
        PSICOPEDAGOGIA: "Psicopedagogia",
      };

      setSuccessMessage(
        `Histórico de ${areaLabels[areaType]} salvo com sucesso! (${sessionsCompleted} sessões)`
      );

      // Atualiza o componente de histórico forçando uma nova renderização
      setRefreshHistory((prev) => prev + 1);
    } catch (err) {
      console.error("Erro ao salvar histórico:", err);
      setError("Erro ao salvar o histórico. Tente novamente.");
    } finally {
      setSavingArea(null);
    }
  };

  const handleSaveSuccess = (newPatient) => {
    setPatients((prev) => [...prev, newPatient]);
    setSelectedPatientId(newPatient.id);
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
        startIcon={<AddIcon />}
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={areaType}>
              <AreaChecklist
                areaType={areaType}
                checkboxes={patientData.checkboxes.filter(
                  (c) => c.area === areaType
                )}
                onCheckboxToggle={handleCheckboxToggle}
                onDateChange={handleDateChange}
                onSaveClick={handleSaveAreaHistory} // <-- CONEXÃO
                saving={savingArea === areaType} // <-- CONEXÃO
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

      {selectedPatientId && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Histórico de Atendimentos 📅
          </Typography>
          <HistoryList patientId={selectedPatientId} key={refreshHistory} />
        </Box>
      )}

      {/* Snackbar de sucesso */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage("")}
        message={successMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}

export default PatientCard;
