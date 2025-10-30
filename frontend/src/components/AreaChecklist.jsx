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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

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
}) {
  const [editingCheckbox, setEditingCheckbox] = useState(null);
  const [newDate, setNewDate] = useState("");

  const title = areaLabels[areaType];

  const allCheckboxes = Array.from({ length: 8 }, (_, i) => {
    const number = i + 1;
    const existing = checkboxes.find(
      (c) => c.checkboxNumber === number && c.area === areaType
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
    // Converte a data para o formato yyyy-MM-dd para o input type="date"
    if (checkbox.checkedDate) {
      const date = new Date(checkbox.checkedDate);
      // Usa UTC para evitar problemas de timezone
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      setNewDate(formattedDate);
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
      // Cria a data no meio-dia UTC para evitar problemas de timezone
      // newDate está no formato "yyyy-MM-dd"
      const [year, month, day] = newDate.split("-");
      const dateAtNoon = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      const isoDate = dateAtNoon.toISOString();
      onDateChange(areaType, editingCheckbox.checkboxNumber, isoDate);
      handleCloseEditDialog();
    }
  };

  return (
    <>
      <Card variant="outlined" sx={{ minWidth: 275, mb: 2 }}>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom>
            {title}
          </Typography>
          <FormGroup>
            {allCheckboxes.map((data) => (
              <Box
                key={data.checkboxNumber}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
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
                          !data.isChecked
                        )
                      }
                      name={`checkbox-${data.checkboxNumber}`}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        Sessão {data.checkboxNumber}
                      </Typography>
                      {data.isChecked && data.checkedDate && (
                        <Typography variant="caption" color="text.secondary">
                          Registrado em:{" "}
                          {new Date(data.checkedDate).toLocaleDateString(
                            "pt-BR"
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
                    sx={{ ml: 1 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
          </FormGroup>
        </CardContent>
      </Card>

      {/* Dialog para editar a data */}
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
            InputLabelProps={{
              shrink: true,
            }}
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
