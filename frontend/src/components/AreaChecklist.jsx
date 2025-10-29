import {
  Card,
  CardContent,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
} from "@mui/material";

// Mapeamento das áreas do Prisma para a exibição na tela
const areaLabels = {
  FONO: "Fonoaudiologia",
  TO: "Terapia Ocupacional",
  PSICO: "Psicologia",
  PSICOPEDAGOGIA: "Psicopedagogia",
};

function AreaChecklist({ areaType, checkboxes, onCheckboxToggle }) {
  const title = areaLabels[areaType];

  // Cria 8 estruturas, preenchendo com dados existentes ou valores padrão
  const allCheckboxes = Array.from({ length: 8 }, (_, i) => {
    const number = i + 1;
    // Tenta encontrar o checkbox persistido no banco
    const existing = checkboxes.find(
      (c) => c.checkboxNumber === number && c.area === areaType
    );
    return (
      existing || {
        id: null, // indica que é novo/não persistido
        checkboxNumber: number,
        isChecked: false,
        checkedDate: null,
        area: areaType,
      }
    );
  });

  return (
    <Card variant="outlined" sx={{ minWidth: 275, mb: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <FormGroup>
          {allCheckboxes.map((data) => (
            <FormControlLabel
              key={data.checkboxNumber}
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
                      {new Date(data.checkedDate).toLocaleString("pt-BR")}
                    </Typography>
                  )}
                </Box>
              }
            />
          ))}
        </FormGroup>
      </CardContent>
    </Card>
  );
}

export default AreaChecklist;
