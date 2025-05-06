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

            // Calcula a diferença entre o valor real e o baseline
            const difference = frente.baseline - frente.value; // Calcula a diferença diretamente

            // Aplica a cor com base na diferença
            if (difference <= 0) {
                progressBarFill.style.backgroundColor = "#007D7A"; // Igual ou maior que o previsto (verde)
            } else {
                progressBarFill.style.backgroundColor = "red"; // Abaixo do previsto (vermelho)
            }

// Adiciona o texto do baseline e do real
const baselineText = document.createElement("p");
baselineText.className = "baseline-text";
baselineText.innerHTML = `Planejado: ${frente.baseline}%<br>Real: ${frente.value}%`;

progressBar.appendChild(progressBarFill);
card.appendChild(image); // Adiciona a imagem ao card
card.appendChild(title);
card.appendChild(progressBar);
card.appendChild(baselineText);

            // Adiciona atividades secundárias
            let subActivitiesList = null;
            if (frente.sub_activities && frente.sub_activities.length > 0) {
                subActivitiesList = document.createElement("ul");
                subActivitiesList.style.display = "none"; // Esconde inicialmente

                frente.sub_activities.forEach(subActivity => {
                    const listItem = document.createElement("li");
                    listItem.textContent = `${subActivity.name}: ${subActivity.value}%`;
                    subActivitiesList.appendChild(listItem);
                });

                card.appendChild(subActivitiesList);
            }

            // Adiciona evento de clique para exibir/ocultar atividades secundárias
            card.addEventListener("click", (event) => {
                // Evita que o clique afete outros cards
                event.stopPropagation();

                // Verifica se o card tem subatividades antes de alternar a visibilidade
                if (subActivitiesList) {
                    subActivitiesList.style.display =
                        subActivitiesList.style.display === "none" ? "block" : "none";
                }
            });

            dashboard.appendChild(card);
        });
    }

    // Função para carregar os dados da API
    async function loadFrentes() {
        try {
            const response = await fetch("/api/frentes");

            // Verifica se a resposta é válida
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
            }

            const frentes = await response.json();
            renderDashboard(frentes);
        } catch (error) {
            console.error("Erro ao carregar os dados:", error);

            // Exibe uma mensagem de erro no dashboard
            dashboard.innerHTML = `<p class="error-message">Erro ao carregar os dados. Tente novamente mais tarde.</p>`;
        }
    }

    // Carregar os dados e renderizar o dashboard
    loadFrentes();
});