import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Collapse,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import {
  fetchPatientHistory,
  deleteHistory,
} from "../../../backend/service/historyService";

const areaLabels = {
  FONO: "Fonoaudiologia",
  TO: "Terapia Ocupacional",
  PSICO: "Psicologia",
  PSICOPEDAGOGIA: "Psicopedagogia",
};

const areaColors = {
  FONO: "#2196F3",
  TO: "#4CAF50",
  PSICO: "#FF9800",
  PSICOPEDAGOGIA: "#9C27B0",
};

const HistoryList = ({ patientId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [historyIdToDelete, setHistoryIdToDelete] = useState(null);

  const loadHistory = async () => {
    if (!patientId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchPatientHistory(patientId);
      // Ordena por data mais recente primeiro
      const sortedData = data.sort(
        (a, b) => new Date(b.savedAt) - new Date(a.savedAt)
      );
      setHistory(sortedData);
    } catch (err) {
      setError("Não foi possível carregar o histórico.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [patientId]);

  const handleDelete = (historyId) => {
    setHistoryIdToDelete(historyId);
    setOpenDeleteDialog(true);
  };

  // Função que executa a exclusão após a confirmação no diálogo
  const handleConfirmDelete = async () => {
    if (!historyIdToDelete) return;

    try {
      await deleteHistory(historyIdToDelete);
      setHistory((prev) => prev.filter((h) => h.id !== historyIdToDelete));
    } catch (err) {
      setError("Erro ao excluir registro. Tente novamente.");
      console.error(err);
    } finally {
      // Fecha o diálogo e limpa o ID, independentemente do sucesso/falha
      setOpenDeleteDialog(false);
      setHistoryIdToDelete(null);
    }
  };

  // Função para fechar o diálogo sem excluir
  const handleCloseDialog = () => {
    setOpenDeleteDialog(false);
    setHistoryIdToDelete(null);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!patientId) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Selecione um paciente para ver o histórico de atendimentos.
      </Alert>
    );
  }

  if (history.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Nenhum histórico registrado ainda. Clique em "GRAVAR HISTÓRICO" nas
        áreas para salvar o progresso.
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold", width: "40px" }}></TableCell>

              <TableCell sx={{ fontWeight: "bold" }}>Especialidade</TableCell>

              <TableCell sx={{ fontWeight: "bold" }}>Sessões</TableCell>

              <TableCell sx={{ fontWeight: "bold" }}>
                Data de Registro
              </TableCell>

              <TableCell sx={{ fontWeight: "bold", width: "80px" }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {history.map((record) => (
              <>
                <TableRow
                  key={record.id}
                  hover
                  sx={{
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#fafafa" },
                  }}
                >
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => toggleExpand(record.id)}
                    >
                      {expandedId === record.id ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={areaLabels[record.area]}
                      sx={{
                        backgroundColor: areaColors[record.area],
                        color: "white",
                        fontWeight: "bold",
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {record.sessionsCompleted} de 8 completas
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(record.savedAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}{" "}
                      às{" "}
                      {new Date(record.savedAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Excluir registro">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(record.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>

                {/* Linha expansível com detalhes */}
                <TableRow>
                  <TableCell
                    colSpan={5}
                    sx={{
                      py: 0,
                      borderBottom: expandedId === record.id ? 1 : 0,
                    }}
                  >
                    <Collapse
                      in={expandedId === record.id}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Box sx={{ py: 2, px: 2, backgroundColor: "#fafafa" }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ mb: 1, fontWeight: "bold" }}
                        >
                          Detalhes das Sessões:
                        </Typography>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(200px, 1fr))",
                            gap: 1,
                          }}
                        >
                          {record.checkboxes
                            .filter((c) => c.isChecked)
                            .map((checkbox) => (
                              <Card
                                key={checkbox.checkboxNumber}
                                variant="outlined"
                                sx={{
                                  p: 1,
                                  backgroundColor: "white",
                                  borderLeft: `4px solid ${
                                    areaColors[record.area]
                                  }`,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  Sessão {checkbox.checkboxNumber}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {new Date(
                                    checkbox.checkedDate
                                  ).toLocaleDateString("pt-BR")}
                                </Typography>
                              </Card>
                            ))}
                        </Box>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" variant="h5" component="h2">
          {"Confirmar Exclusão"}
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Deseja excluir permanentemente este registro de histórico? Esta ação
            não pode ser desfeita.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            color="primary"
            variant="contained"
          >
            Cancelar
          </Button>

          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            autoFocus
          >
            Sim, Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistoryList;
