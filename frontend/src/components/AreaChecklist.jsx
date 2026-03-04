import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Grid, // Importado para as colunas
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

const areaLabels = {
  FONO: "Fonoaudiologia",
  TO: "Terapia Ocupacional",
  PSICO: "Psicologia",
  PSICOPEDAGOGIA: "Psicopedagogia",
};

function AreaChecklist({
  areaType,
  checkboxes,
  onCheckboxToggle,
  onDateChange,
  onSaveClick,
  saving = false,
}) {
  const [editingCheckbox, setEditingCheckbox] = useState(null);
  const [newDate, setNewDate] = useState("");

  const title = areaLabels[areaType];

  // Garante que sempre teremos 10 espaços, preenchendo com os dados do banco onde existirem
  const allCheckboxes = Array.from({ length: 10 }, (_, i) => {
    const number = i + 1;
    const existing = checkboxes.find(
      (c) => c.checkboxNumber === number && c.area === areaType,
    );
    return (
      existing || {
        id: null,
        checkboxNumber: number,
        isChecked: false,
        checkedDate: null,
        area: areaType,
      }
    );
  });

  const handleOpenEditDialog = (checkbox) => {
    setEditingCheckbox(checkbox);
    if (checkbox.checkedDate) {
      const date = new Date(checkbox.checkedDate);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      setNewDate(`${year}-${month}-${day}`);
    } else {
      setNewDate("");
    }
  };

  const handleCloseEditDialog = () => {
    setEditingCheckbox(null);
    setNewDate("");
  };

  const handleSaveDate = () => {
    if (editingCheckbox && newDate) {
      const [year, month, day] = newDate.split("-");
      const dateAtNoon = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      onDateChange(
        areaType,
        editingCheckbox.checkboxNumber,
        dateAtNoon.toISOString(),
      );
      handleCloseEditDialog();
    }
  };

  return (
    <>
      <Card variant="outlined" sx={{ minWidth: 275, mb: 2 }}>
        <CardContent>
          <Typography
            variant="h6"
            component="div"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            {title}
          </Typography>

          <FormGroup>
            {/* Grid para exibir em 2 colunas */}
            <Grid container spacing={1}>
              {allCheckboxes.map((data) => (
                <Grid item xs={12} sm={6} key={data.checkboxNumber}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 0.5,
                      border: "1px solid #f0f0f0",
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={data.isChecked}
                          onChange={() =>
                            onCheckboxToggle(
                              areaType,
                              data.checkboxNumber,
                              !data.isChecked,
                            )
                          }
                          name={`checkbox-${data.checkboxNumber}`}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Sessão {data.checkboxNumber}
                          </Typography>
                          {data.isChecked && data.checkedDate && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              {new Date(data.checkedDate).toLocaleDateString(
                                "pt-BR",
                              )}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    {data.isChecked && (
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditDialog(data)}
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </FormGroup>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => onSaveClick(areaType)}
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            sx={{ mt: 2 }}
          >
            {saving ? "Gravando..." : "Gravar Histórico"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={!!editingCheckbox} onClose={handleCloseEditDialog}>
        <DialogTitle>Editar Data da Sessão</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Sessão {editingCheckbox?.checkboxNumber} - {title}
          </Typography>
          <TextField
            type="date"
            label="Nova Data"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button
            onClick={handleSaveDate}
            variant="contained"
            disabled={!newDate}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AreaChecklist;
