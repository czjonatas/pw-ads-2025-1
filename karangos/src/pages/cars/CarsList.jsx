import React from "react";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import IconButton from "@mui/material/IconButton";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {
  feedbackWait,
  feedbackConfirm,
  feedbackNotify,
} from "../../ui/Feedback";

// Componente de célula seguro
const SafeCell = ({ children }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error("Erro ao renderizar célula:", error);
    return <span style={{ color: "red" }}>Erro de renderização</span>;
  }
};

export default function CarsList() {
  const navigate = useNavigate();

  const columns = [
    {
      field: "id",
      headerName: "Cód.",
      width: 90,
      renderCell: (params) => <SafeCell>{params.value}</SafeCell>,
    },
    {
      field: "brand_model",
      headerName: "Marca/Modelo",
      width: 250,
      renderCell: (params) => (
        <SafeCell>
          {params.row.brand || "N/A"} {params.row.model || "N/A"}
        </SafeCell>
      ),
    },
    {
      field: "color",
      headerName: "Cor",
      width: 150,
      renderCell: (params) => <SafeCell>{params.value || "N/A"}</SafeCell>,
    },
    {
      field: "year_manufacture",
      headerName: "Ano Fab.",
      width: 120,
      renderCell: (params) => <SafeCell>{params.value || "N/A"}</SafeCell>,
    },
    {
      field: "imported",
      headerName: "Importado",
      width: 120,
      renderCell: (params) => (
        <SafeCell>{params.value ? "SIM" : "NÃO"}</SafeCell>
      ),
    },
    {
      field: "plates",
      headerName: "Placas",
      width: 150,
      renderCell: (params) => <SafeCell>{params.value || "N/A"}</SafeCell>,
    },
    {
      field: "selling_price",
      headerName: "Preço de venda",
      width: 180,
      renderCell: (params) => (
        <SafeCell>
          {params.value
            ? new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(Number(params.value))
            : "N/A"}
        </SafeCell>
      ),
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <SafeCell>
          <IconButton
            aria-label="editar"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`./${params.id}`);
            }}
          >
            <EditIcon />
          </IconButton>

          <IconButton
            aria-label="excluir"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteButtonClick(params.id);
            }}
          >
            <DeleteForeverIcon color="error" />
          </IconButton>
        </SafeCell>
      ),
    },
  ];

  const [cars, setCars] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  async function loadData() {
    setLoading(true);
    feedbackWait(true);
    try {
      const response = await fetch("https://api.faustocintra.com.br/cars");

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Validação completa dos dados
      const validatedCars = data.map((car) => {
        // Garante que todos os campos obrigatórios existam
        return {
          id: car.id || Math.random().toString(36).substr(2, 9),
          brand: car.brand || "",
          model: car.model || "",
          color: car.color || "",
          year_manufacture: car.year_manufacture || "",
          imported: Boolean(car.imported),
          plates: car.plates || "",
          selling_price: car.selling_price || null,
        };
      });

      setCars(validatedCars);
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
      feedbackNotify("ERRO: " + error.message, "error");
    } finally {
      setLoading(false);
      feedbackWait(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  async function handleDeleteButtonClick(id) {
    if (await feedbackConfirm("Deseja realmente excluir este veículo?")) {
      feedbackWait(true);
      try {
        const response = await fetch(
          `https://api.faustocintra.com.br/cars/${id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        // Atualização local
        setCars((prevCars) => prevCars.filter((car) => car.id !== id));
        feedbackNotify("Veículo excluído com sucesso.", "success");
      } catch (error) {
        console.error("Erro ao excluir veículo:", error);
        feedbackNotify("ERRO: " + error.message, "error");
      } finally {
        feedbackWait(false);
      }
    }
  }

  return (
    <>
      <Typography variant="h1" gutterBottom>
        Listagem de veículos
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          size="large"
          color="secondary"
          startIcon={<AddCircleIcon />}
          onClick={() => navigate("./new")}
        >
          Novo veículo
        </Button>
      </Box>

      <Paper sx={{ height: 400, width: "100%" }} elevation={10}>
        <DataGrid
          rows={cars}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          onRowClick={(params) => navigate(`./${params.id}`)}
          localeText={{
            noRowsLabel: "Nenhum veículo encontrado",
            errorOverlayDefaultLabel: "Ocorreu um erro",
            footerRowSelected: (count) =>
              count !== 1
                ? `${count.toLocaleString()} veículos selecionados`
                : `${count.toLocaleString()} veículo selecionado`,
          }}
        />
      </Paper>
    </>
  );
}
