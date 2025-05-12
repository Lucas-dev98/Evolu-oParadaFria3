document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const dropdownButton = document.querySelector('.dropdown-button');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    // Define a seção padrão que será exibida ao carregar a página
    const defaultSectionId = 'manutencao'; // Altere para o ID da seção que deseja exibir por padrão
    const defaultSection = document.getElementById(defaultSectionId);

    // Exibe a seção padrão
    sections.forEach((section) => {
        if (section === defaultSection) {
            section.classList.remove('hidden');
            section.style.display = 'block';
        } else {
            section.classList.add('hidden');
            section.style.display = 'none';
        }
    });

    // Exibe/oculta o menu do dropdown
    dropdownButton.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Alterna entre as seções
    dropdownMenu.addEventListener('click', (event) => {
        const sectionId = event.target.getAttribute('data-section');
        if (sectionId) {
            sections.forEach((section) => {
                if (section.id === sectionId) {
                    section.classList.remove('hidden'); // Exibe a seção selecionada
                    section.style.display = 'block'; // Garante que a seção seja exibida
                } else {
                    section.classList.add('hidden'); // Oculta as outras seções
                    section.style.display = 'none'; // Garante que as outras seções sejam ocultadas
                }
            });
            dropdownMenu.style.display = 'none'; // Fecha o menu após a seleção
        }
    });

    // Fecha o menu se clicar fora dele
    document.addEventListener('click', (event) => {
        if (!dropdownMenu.contains(event.target) && !dropdownButton.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    // Função para renderizar categorias
    function renderCategoria(categoria, container) {
        container.innerHTML = ''; // Limpar o conteúdo existente

        if (categoria && categoria.length > 0) {
            categoria.forEach((frente) => {
                const card = document.createElement('div');
                card.className = 'card';

                const image = document.createElement('img');
                image.src = frente.image;
                image.alt = frente.name;
                image.className = 'activity-image';

                const title = document.createElement('h2');
                title.textContent = frente.name;

                const mainValues = document.createElement('p');
                mainValues.innerHTML = `
                    <strong>Real:</strong> ${frente.real}%<br>
                    <strong>Planejado:</strong> ${frente.planned}%
                `;

                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';

                const progressBarFill = document.createElement('div');
                progressBarFill.className = 'progress-bar-fill';
                progressBarFill.style.width = `${frente.real}%`;
                progressBarFill.textContent = `${frente.real}%`;

                if (frente.real >= frente.planned) {
                    progressBarFill.style.backgroundColor = '#007D7A';
                } else {
                    progressBarFill.style.backgroundColor = 'red';
                }

                progressBar.appendChild(progressBarFill);

                const subActivitiesContainer = document.createElement('div');
                subActivitiesContainer.className = 'sub-activities-container';
                subActivitiesContainer.style.display = 'none';

                if (frente.sub_activities && frente.sub_activities.length > 0) {
                    const subActivitiesList = document.createElement('ul');

                    frente.sub_activities.forEach((subActivity) => {
                        const listItem = document.createElement('li');
                        listItem.innerHTML = `
                            <strong>${subActivity.name}:</strong><br>
                            <strong>Real:</strong> ${subActivity.real}%<br>
                            <strong>Planejado:</strong> ${subActivity.planned}%
                        `;

                        if (subActivity.real !== subActivity.planned) {
                            listItem.style.color = 'red';
                        }

                        subActivitiesList.appendChild(listItem);
                    });

                    subActivitiesContainer.appendChild(subActivitiesList);
                }

                card.addEventListener('click', () => {
                    subActivitiesContainer.style.display =
                        subActivitiesContainer.style.display === 'none' ? 'block' : 'none';
                });

                card.appendChild(image);
                card.appendChild(title);
                card.appendChild(mainValues);
                card.appendChild(progressBar);
                card.appendChild(subActivitiesContainer);

                container.appendChild(card);
            });
        } else {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = "Nenhuma frente de trabalho disponível.";
            container.appendChild(emptyMessage);
        }
    }

    // Função para carregar frentes de trabalho
    async function loadFrentes(url, container) {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `Erro na requisição: ${response.status} - ${response.statusText}`
                );
            }

            const frentes = await response.json();
            renderCategoria(frentes, container);
        } catch (error) {
            console.error('Erro ao carregar os dados:', error);
            container.innerHTML = `<p class="error-message">Erro ao carregar os dados. Tente novamente mais tarde.</p>`;
        }
    }

    // Carregar os dados de cada categoria
    loadFrentes('/api/procedimento_parada', document.getElementById('dashboard-parada'));
    loadFrentes('/api/manutencao', document.getElementById('dashboard-manutencao'));
    loadFrentes('/api/procedimento_partida', document.getElementById('dashboard-partida'));
});