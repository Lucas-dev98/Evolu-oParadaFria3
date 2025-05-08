document.addEventListener('DOMContentLoaded', () => {
    const dashboard = document.getElementById('dashboard');
  
    // Função para renderizar o dashboard
    function renderDashboard(frentes) {
      dashboard.innerHTML = ''; // Limpar o conteúdo existente
      frentes.forEach((frente) => {
        const card = document.createElement('div');
        card.className = 'card';
  
        // Adiciona a imagem da atividade principal
        const image = document.createElement('img');
        image.src = frente.image; // URL da imagem
        image.alt = frente.name; // Texto alternativo
        image.className = 'activity-image';
  
        // Adiciona o título da atividade principal
        const title = document.createElement('h2');
        title.textContent = frente.name;
  
        // Adiciona os valores de real e planejado da atividade principal
        const mainValues = document.createElement('p');
        mainValues.innerHTML = `
          <strong>Real:</strong> ${frente.real}%<br>
          <strong>Planejado:</strong> ${frente.planned}%
        `;
  
        // Adiciona a barra de progresso
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
  
        const progressBarFill = document.createElement('div');
        progressBarFill.className = 'progress-bar-fill';
        progressBarFill.style.width = `${frente.real}%`;
        progressBarFill.textContent = `${frente.real}%`;
  
        // Aplica a cor com base na diferença entre real e planejado
        if (frente.real >= frente.planned) {
          progressBarFill.style.backgroundColor = '#007D7A'; // Verde
        } else {
          progressBarFill.style.backgroundColor = 'red'; // Vermelho
        }
  
        progressBar.appendChild(progressBarFill);
  
        // Cria um contêiner para as subatividades (inicialmente oculto)
        const subActivitiesContainer = document.createElement('div');
        subActivitiesContainer.className = 'sub-activities-container';
        subActivitiesContainer.style.display = 'none'; // Inicialmente escondido
  
        // Adiciona as subatividades
        if (frente.sub_activities && frente.sub_activities.length > 0) {
          const subActivitiesList = document.createElement('ul');
  
          frente.sub_activities.forEach((subActivity) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
              <strong>${subActivity.name}:</strong><br>
              <strong>Real:</strong> ${subActivity.real}%<br>
              <strong>Planejado:</strong> ${subActivity.planned}%
            `;
  
            // Aplica a cor vermelha se o real for diferente do planejado
            if (subActivity.real !== subActivity.planned) {
              listItem.style.color = 'red';
            }
  
            subActivitiesList.appendChild(listItem);
          });
  
          subActivitiesContainer.appendChild(subActivitiesList);
        }
  
        // Adiciona evento de clique para expandir/colapsar as subatividades
        card.addEventListener('click', () => {
          subActivitiesContainer.style.display =
            subActivitiesContainer.style.display === 'none' ? 'block' : 'none';
        });
  
        // Adiciona os elementos ao card
        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(mainValues);
        card.appendChild(progressBar);
        card.appendChild(subActivitiesContainer);
  
        dashboard.appendChild(card);
      });
    }
  
    // Função para carregar os dados da API
    async function loadFrentes() {
      try {
        const response = await fetch('/api/frentes');
  
        if (!response.ok) {
          throw new Error(
            `Erro na requisição: ${response.status} - ${response.statusText}`
          );
        }
  
        const frentes = await response.json();
        renderDashboard(frentes);
      } catch (error) {
        console.error('Erro ao carregar os dados:', error);
        dashboard.innerHTML = `<p class="error-message">Erro ao carregar os dados. Tente novamente mais tarde.</p>`;
      }
    }
  
    // Carregar os dados e renderizar o dashboard
    loadFrentes();
  });