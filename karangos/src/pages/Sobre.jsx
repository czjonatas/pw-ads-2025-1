import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export default function Sobre() {
  const [conteudo, setConteudo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        setErro(null);

        //    aqui a url da api
        const apiUrl = import.meta.env.VITE_API_BASE
          ? `${import.meta.env.VITE_API_BASE}/sobre/1`
          : "https://api.faustocintra.com.br/sobre/1";

        console.log("Carregando dados de:", apiUrl);

        const resposta = await fetch(apiUrl);

        const contentType = resposta.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const texto = await resposta.text();
          throw new Error(`Resposta não é JSON: ${texto.substring(0, 100)}`);
        }

        if (!resposta.ok) {
          throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const dados = await resposta.json();

        if (!dados.info) {
          throw new Error("Dados inválidos: propriedade 'info' não encontrada");
        }

        setConteudo(dados.info);
      } catch (error) {
        console.error("Erro ao carregar conteúdo:", error);
        setErro(error.message);

        setConteudo(`
          <div style="padding: 20px; color: black;">
            <h1 style="color: #d32f2f;">KARANGOS</h1>
            <p style="font-style: italic; color: black;">Os resultados são nossa justiça</p>
            <h2 style="color: black;">Sobre o Projeto Karangos</h2>
            <p style="color: black;">Não foi possível carregar o conteúdo neste momento.</p>
            <p style="color: black;"><strong>Erro:</strong> ${error.message}</p>
          </div>
        `);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Typography
        variant="h1"
        gutterBottom
        sx={{
          color: "#1976d2",
          borderBottom: "2px solid #1976d2",
          paddingBottom: "10px",
          marginBottom: "20px",
        }}
      >
        Sobre o Projeto Karangos
      </Typography>

      {carregando ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
          }}
        >
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Box
          sx={{
            p: 3,
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            backgroundColor: "#fafafa",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            minHeight: "300px",
            color: "black",
          }}
        >
          {conteudo ? (
            <div
              dangerouslySetInnerHTML={{ __html: conteudo }}
              style={{
                lineHeight: "1.6",
                fontSize: "1.1rem",
                color: "black",
              }}
            />
          ) : (
            <Typography variant="h5" sx={{ color: "black" }}>
              Conteúdo não disponível
            </Typography>
          )}
        </Box>
      )}

      {erro && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: "#ffebee",
            borderRadius: "4px",
            borderLeft: "4px solid #d32f2f",
            color: "black",
          }}
        >
          <Typography variant="h6" sx={{ color: "black" }}>
            Erro:
          </Typography>
          <Typography sx={{ color: "black" }}>{erro}</Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "black" }}>
            Verifique a conexão com a internet ou tente novamente mais tarde.
          </Typography>
        </Box>
      )}
    </div>
  );
}
