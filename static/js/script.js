document.addEventListener("DOMContentLoaded", () => {
    const dashboard = document.getElementById("dashboard");

    // Função para renderizar o dashboard
    function renderDashboard(frentes) {
        dashboard.innerHTML = ""; // Limpar o conteúdo existente
        frentes.forEach(frente => {
            const card = document.createElement("div");
            card.className = "card";

            // Adiciona a imagem
            const image = document.createElement("img");
            image.src = frente.image;
            image.alt = frente.name;
            image.style.width = "100%";
            image.style.borderRadius = "8px";

            const title = document.createElement("h2");
            title.textContent = frente.name;

            const progressBar = document.createElement("div");
            progressBar.className = "progress-bar";

            const progressBarFill = document.createElement("div");
            progressBarFill.className = "progress-bar-fill";
            progressBarFill.style.width = `${frente.value}%`;
            progressBarFill.textContent = `${frente.value}%`;

            progressBar.appendChild(progressBarFill);
            card.appendChild(image); // Adiciona a imagem ao card
            card.appendChild(title);
            card.appendChild(progressBar);
            dashboard.appendChild(card);
        });
    }

    // Função para carregar os dados da API
    async function loadFrentes() {
        try {
            const response = await fetch("/api/frentes");
            const frentes = await response.json();
            renderDashboard(frentes);
        } catch (error) {
            console.error("Erro ao carregar os dados:", error);
        }
    }

    // Carregar os dados e renderizar o dashboard
    loadFrentes();
});