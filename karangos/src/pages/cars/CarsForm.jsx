// src/pages/cars/CarsForm.jsx
import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import { useNavigate, useParams } from "react-router-dom";
import {
  feedbackWait,
  feedbackNotify,
  feedbackConfirm,
} from "../../ui/Feedback";
import { useMask } from "@react-input/mask";

export default function CarsForm() {
  const navigate = useNavigate();
  const params = useParams();

  const colors = [
    "Amarelo",
    "Azul",
    "Branco",
    "Cinza",
    "Preto",
    "Prata",
    "Verde",
    "Vermelho",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1950 },
    (_, i) => currentYear - i
  );

  const platesRef = useMask({
    mask: "AAA-9S99",
    replacement: {
      A: /[A-Z]/,
      9: /[0-9]/,
      S: /[A-J0-9]/,
    },
    showMask: false,
  });

  const formDefaults = {
    brand: "",
    model: "",
    color: "",
    year_manufacture: "",
    imported: false,
    plates: "",
    selling_price: "",
  };

  const [state, setState] = React.useState({
    car: { ...formDefaults },
    formModified: false,
  });
  const { car, formModified } = state;

  React.useEffect(() => {
    if (params.id) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function loadData() {
    feedbackWait(true);
    try {
      const response = await fetch(
        `https://api.faustocintra.com.br/cars/${params.id}`
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      // Converter todos os campos para strings para o formulário
      const formattedCar = {
        ...result,
        year_manufacture: result.year_manufacture
          ? String(result.year_manufacture)
          : "",
        selling_price: result.selling_price ? String(result.selling_price) : "",
      };

      setState({ car: formattedCar, formModified: false });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      feedbackNotify("ERRO: " + error.message);
    } finally {
      feedbackWait(false);
    }
  }

  function handleFieldChange(event) {
    let { name, value } = event.target;

    if (name === "selling_price") {
      // Permitir apenas números e ponto decimal
      value = value.replace(/[^0-9.]/g, "");

      // Garantir apenas um ponto decimal
      const parts = value.split(".");
      if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("");
      }
    }

    if (name === "plates") {
      value = value.toUpperCase();
    }

    const carCopy = { ...car, [name]: value };
    setState({ car: carCopy, formModified: true });
  }

  function handleCheckboxChange(event) {
    const { name, checked } = event.target;
    const carCopy = { ...car, [name]: checked };
    setState({ car: carCopy, formModified: true });
  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    feedbackWait(true);

    try {
      // Preparar objeto para envio com conversão de tipos
      const carToSend = {
        brand: car.brand,
        model: car.model,
        color: car.color,
        year_manufacture: car.year_manufacture
          ? parseInt(car.year_manufacture, 10)
          : null,
        imported: Boolean(car.imported),
        plates: car.plates,
        selling_price: car.selling_price ? parseFloat(car.selling_price) : null,
      };

      console.log("Dados sendo enviados:", carToSend);

      const reqOptions = {
        method: params.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carToSend),
      };

      const url = params.id
        ? `https://api.faustocintra.com.br/cars/${params.id}`
        : "https://api.faustocintra.com.br/cars";

      const response = await fetch(url, reqOptions);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log("Resposta da API:", result);

      feedbackNotify("Item salvo com sucesso!", "success", 2500, () => {
        navigate("..", { relative: "path", replace: true });
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      feedbackNotify("ERRO: " + error.message, "error");
    } finally {
      feedbackWait(false);
    }
  }

  async function handleBackButtonClick() {
    if (
      formModified &&
      !(await feedbackConfirm(
        "Há informações não salvas. Deseja realmente sair?"
      ))
    ) {
      return;
    }
    navigate("..", { relative: "path", replace: true });
  }

  return (
    <>
      <Typography variant="h1" gutterBottom>
        {params.id ? "Edição" : "Cadastro"} de veículo
      </Typography>

      <Box
        component="form"
        onSubmit={handleFormSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          name="brand"
          label="Marca"
          fullWidth
          required
          value={car.brand}
          onChange={handleFieldChange}
        />

        <TextField
          name="model"
          label="Modelo"
          fullWidth
          required
          value={car.model}
          onChange={handleFieldChange}
        />

        <TextField
          name="color"
          label="Cor"
          fullWidth
          select
          required
          value={car.color}
          onChange={handleFieldChange}
        >
          {colors.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          name="year_manufacture"
          label="Ano de fabricação"
          fullWidth
          select
          required
          value={car.year_manufacture}
          onChange={handleFieldChange}
        >
          {years.map((y) => (
            <MenuItem key={y} value={String(y)}>
              {y}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Checkbox
            name="imported"
            checked={car.imported}
            onChange={handleCheckboxChange}
          />
          <Typography>Importado</Typography>
        </Box>

        <TextField
          inputRef={platesRef}
          name="plates"
          label="Placas"
          fullWidth
          required
          value={car.plates}
          onChange={handleFieldChange}
        />

        <TextField
          name="selling_price"
          label="Preço de venda"
          fullWidth
          value={car.selling_price}
          onChange={handleFieldChange}
          inputProps={{
            inputMode: "decimal",
          }}
        />

        <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}>
          <Button variant="contained" color="secondary" type="submit">
            Salvar
          </Button>
          <Button variant="outlined" onClick={handleBackButtonClick}>
            Voltar
          </Button>
        </Box>
      </Box>
    </>
  );
}
