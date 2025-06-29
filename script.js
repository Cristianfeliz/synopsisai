
        // DOM Elements
        const themeToggle = document.getElementById('themeToggle');
        const tabs = document.querySelectorAll('.tab');
        const tabPanes = document.querySelectorAll('.tab-pane');
        const fileDropArea = document.getElementById('fileDropArea');
        const fileInput = document.getElementById('fileInput');
        const fileNameContainer = document.getElementById('fileNameContainer');
        const fileName = document.getElementById('fileName');
        const summarizeFileBtn = document.getElementById('summarizeFile');
        const summarizeYoutubeBtn = document.getElementById('summarizeYoutube');
        const summarizeWebBtn = document.getElementById('summarizeWeb');
        const resultsContainer = document.getElementById('resultsContainer');
        const summaryContent = document.getElementById('summaryContent');
        const historyContainer = document.getElementById('historyContainer');
        const optionBtns = document.querySelectorAll('.option-btn');
        const copySummaryBtn = document.getElementById('copySummary');
        const notification = document.getElementById('notification');
        
        // App State
        let currentTheme = localStorage.getItem('theme') || 'dark';
        let currentSummaryStyle = 'concise';
        let historyItems = JSON.parse(localStorage.getItem('history')) || [];
        
        // Initialize App
        function initApp() {
            applyTheme();
            setupEventListeners();
            renderHistory();
        }
        
        // Theme Management
        function applyTheme() {
            document.body.setAttribute('data-theme', currentTheme);
            localStorage.setItem('theme', currentTheme);
            
            const icon = themeToggle.querySelector('i');
            if (currentTheme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
        
        function toggleTheme() {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme();
        }
        
        // Tab Switching
        function switchTab(tabName) {
            // Update active tab
            tabs.forEach(tab => {
                if (tab.dataset.tab === tabName) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
            
            // Show active tab pane
            tabPanes.forEach(pane => {
                if (pane.id === `${tabName}-tab`) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
            
            // Reset results when switching tabs
            resultsContainer.classList.remove('active');
        }
        
        // File Upload Handling
        function handleFileUpload(files) {
            if (files.length > 0) {
                const file = files[0];
                const fileExt = file.name.split('.').pop().toLowerCase();
                const validExtensions = ['pdf', 'docx', 'txt', 'mp4'];
                
                if (validExtensions.includes(fileExt)) {
                    fileName.textContent = file.name;
                    fileNameContainer.style.display = 'block';
                    summarizeFileBtn.disabled = false;
                    
                    // Store file for processing
                    window.currentFile = file;
                } else {
                    alert('Formato de archivo no soportado. Por favor, sube un archivo PDF, DOCX, TXT o MP4.');
                }
            }
        }
        
        // Summary Style Selection
        function selectSummaryStyle(style) {
            currentSummaryStyle = style;
            optionBtns.forEach(btn => {
                if (btn.dataset.style === style) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
        
        // Show Summary Result
        function showSummary(content, source) {
            // Clear previous content
            summaryContent.innerHTML = '';
            
            // Format based on selected style
            if (currentSummaryStyle === 'bullets') {
                summaryContent.classList.add('bullets');
                content.split('\n').forEach(point => {
                    if (point.trim()) {
                        const p = document.createElement('p');
                        p.textContent = point;
                        summaryContent.appendChild(p);
                    }
                });
            } else {
                summaryContent.classList.remove('bullets');
                const p = document.createElement('p');
                p.textContent = content;
                summaryContent.appendChild(p);
            }
            
            // Show results container
            resultsContainer.classList.add('active');
            
            // Add to history
            addToHistory(content, source);
            
            // Scroll to results
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        }
        
        // History Management
        function addToHistory(summary, source) {
            const historyItem = {
                id: Date.now(),
                summary: summary,
                source: source,
                type: getCurrentTabType(),
                date: new Date().toISOString(),
                style: currentSummaryStyle
            };
            
            // Add to beginning of history
            historyItems.unshift(historyItem);
            
            // Keep only last 20 items
            if (historyItems.length > 20) {
                historyItems.pop();
            }
            
            // Save to localStorage
            localStorage.setItem('history', JSON.stringify(historyItems));
            
            // Update UI
            renderHistory();
        }
        
        function renderHistory() {
            historyContainer.innerHTML = '';
            
            if (historyItems.length === 0) {
                historyContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: var(--text-light);">
                        <i class="fas fa-history" style="font-size: 3rem; margin-bottom: 20px;"></i>
                        <p>No hay resúmenes en tu historial</p>
                    </div>
                `;
                return;
            }
            
            historyItems.forEach(item => {
                const historyCard = document.createElement('div');
                historyCard.className = 'history-card';
                historyCard.innerHTML = `
                    <div class="history-header">
                        <div class="history-type">
                            <i class="${getIconForType(item.type)}"></i>
                            ${getTypeName(item.type)}
                        </div>
                        <div class="history-actions">
                            <button class="action-btn" onclick="viewHistoryItem(${item.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn" onclick="downloadHistoryItem(${item.id})">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="action-btn" onclick="deleteHistoryItem(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="history-content">
                        ${truncateText(item.summary, 200)}
                    </div>
                    <div class="history-date">
                        ${formatDate(item.date)}
                    </div>
                `;
                historyContainer.appendChild(historyCard);
            });
        }
        
        function getIconForType(type) {
            switch (type) {
                case 'youtube': return 'fab fa-youtube';
                case 'file': return 'fas fa-file';
                case 'web': return 'fas fa-globe';
                default: return 'fas fa-question';
            }
        }
        
        function getTypeName(type) {
            switch (type) {
                case 'youtube': return 'YouTube';
                case 'file': return 'Archivo';
                case 'web': return 'Página Web';
                default: return 'Desconocido';
            }
        }
        
        function getCurrentTabType() {
            return document.querySelector('.tab.active').dataset.tab;
        }
        
        function truncateText(text, maxLength) {
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        }
        
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // Simulate Summarization
        function simulateSummarization(source, type) {
            // Show progress bar
            const progressBar = document.getElementById(`${type}ProgressBar`);
            const progressContainer = document.getElementById(`${type}Progress`);
            progressContainer.classList.add('active');
            
            // Simulate progress
            let width = 0;
            const interval = setInterval(() => {
                if (width >= 100) {
                    clearInterval(interval);
                    
                    // Hide progress after a delay
                    setTimeout(() => {
                        progressContainer.classList.remove('active');
                    }, 500);
                    
                    // Show result
                    const summary = generateSampleSummary(source, type);
                    showSummary(summary, source);
                    return;
                }
                
                width += 5;
                progressBar.style.width = `${width}%`;
            }, 150);
        }
        
        function generateSampleSummary(source, type) {
            const sourceName = type === 'youtube' ? 'video de YouTube' : 
                             type === 'file' ? 'documento' : 'página web';
            
            const styles = {
                concise: `Este es un resumen conciso del ${sourceName} proporcionado. El contenido analizado aborda temas importantes relacionados con la inteligencia artificial y su impacto en la sociedad moderna. Se destacan aspectos clave como la automatización, el aprendizaje automático y las consideraciones éticas. La conclusión principal subraya la necesidad de un desarrollo responsable de estas tecnologías para maximizar sus beneficios.`,
                
                detailed: `Resumen detallado del ${sourceName}:\n\nEl análisis comienza examinando los fundamentos de la inteligencia artificial, definiendo conceptos clave como machine learning, redes neuronales y procesamiento de lenguaje natural. Posteriormente, se exploran aplicaciones prácticas en diversos sectores como salud, finanzas y educación, destacando casos de uso específicos donde estas tecnologías están generando un impacto significativo.\n\nLa sección central aborda los desafíos éticos y sociales, incluyendo preocupaciones sobre privacidad de datos, sesgos algorítmicos y desplazamiento laboral. Se presentan diversas perspectivas sobre cómo mitigar estos riesgos a través de marcos regulatorios y enfoques de diseño centrados en el ser humano.\n\nFinalmente, el documento proyecta tendencias futuras, enfatizando la convergencia entre IA y otras tecnologías emergentes como blockchain y computación cuántica. Se concluye que, aunque existen desafíos significativos, el potencial de la IA para abordar problemas complejos globales es considerable cuando se implementa con responsabilidad y supervisión adecuada.`,
                
                bullets: `Principales puntos clave del ${sourceName}:\n\n- La inteligencia artificial está transformando múltiples industrias mediante la automatización de procesos complejos\n- Los algoritmos de machine learning pueden identificar patrones en grandes conjuntos de datos más rápido que los humanos\n- Existen preocupaciones éticas significativas relacionadas con sesgos en los datos de entrenamiento\n- La transparencia en los algoritmos es crucial para generar confianza pública\n- Las regulaciones gubernamentales están evolucionando para abordar estos desafíos\n- La colaboración entre tecnólogos y legisladores es esencial para un desarrollo responsable\n- Las aplicaciones en salud muestran un potencial particularmente prometedor para mejorar diagnósticos\n- El futuro de la IA probablemente implicará sistemas híbridos que combinen IA con toma de decisiones humana`
            };
            
            return styles[currentSummaryStyle];
        }
        
        // Event Listeners
        function setupEventListeners() {
            // Theme toggle
            themeToggle.addEventListener('click', toggleTheme);
            
            // Tab switching
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    switchTab(tab.dataset.tab);
                });
            });
            
            // File upload handling
            fileDropArea.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', (e) => {
                handleFileUpload(e.target.files);
            });
            
            // Drag and drop
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                fileDropArea.addEventListener(eventName, preventDefaults, false);
            });
            
            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            ['dragenter', 'dragover'].forEach(eventName => {
                fileDropArea.addEventListener(eventName, highlight, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                fileDropArea.addEventListener(eventName, unhighlight, false);
            });
            
            function highlight() {
                fileDropArea.style.borderColor = '#4361ee';
                fileDropArea.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
            }
            
            function unhighlight() {
                fileDropArea.style.borderColor = '';
                fileDropArea.style.backgroundColor = '';
            }
            
            fileDropArea.addEventListener('drop', handleDrop, false);
            
            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                handleFileUpload(files);
            }
            
            // Summary style selection
            optionBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    selectSummaryStyle(btn.dataset.style);
                });
            });
            
            // Summarize buttons
         summarizeYoutubeBtn.addEventListener('click', async () => {
    const url = document.getElementById('youtubeUrl').value;
    const slider = document.getElementById('summaryLength');
    const resumenLength = parseInt(slider.value) <= 3 ? "corto" :
                          parseInt(slider.value) <= 7 ? "medio" : "largo";

    if (!url) {
        alert('Por favor, introduce una URL de YouTube válida');
        return;
    }

    // Activar la barra de progreso
    const progressBar = document.getElementById("youtubeProgressBar");
    const progressText = document.getElementById("youtubeProgressText");
    const progressContainer = document.getElementById("youtubeProgress");
    progressBar.style.width = "0%";
    progressText.textContent = "Procesando...";
    progressContainer.classList.add("active");

    try {
        const res = await fetch("/api/summarize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: url,
                tipo: currentSummaryStyle,  // Ya lo manejas con los botones
                length: resumenLength       // Basado en el slider
            })
        });

        const data = await res.json();
        if (data.error) {
            alert("Error: " + data.error);
        } else {
            showSummary(data.summary, url);
        }
    } catch (err) {
        console.error(err);
        alert("Hubo un error al conectar con el servidor.");
    } finally {
        progressContainer.classList.remove("active");
    }
});

            
            summarizeFileBtn.addEventListener('click', () => {
                if (window.currentFile) {
                    simulateSummarization(window.currentFile.name, 'file');
                }
            });
            
            summarizeWebBtn.addEventListener('click', () => {
                const url = document.getElementById('webUrl').value;
                if (url) {
                    simulateSummarization(url, 'web');
                } else {
                    alert('Por favor, introduce una URL de página web válida');
                }
            });
            
            // Copy summary button
            copySummaryBtn.addEventListener('click', () => {
                const text = summaryContent.innerText;
                navigator.clipboard.writeText(text).then(() => {
                    showNotification('Resumen copiado al portapapeles');
                });
            });
        }
        
        function showNotification(message) {
            notification.querySelector('span').textContent = message;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
        
        // Initialize the app
        document.addEventListener('DOMContentLoaded', initApp);
        
        // Global functions for history actions
        function viewHistoryItem(id) {
            const item = historyItems.find(i => i.id === id);
            if (item) {
                // Set the style
                selectSummaryStyle(item.style);
                
                // Show the summary
                showSummary(item.summary, item.source);
            }
        }
        
        function downloadHistoryItem(id) {
            const item = historyItems.find(i => i.id === id);
            if (item) {
                showNotification(`Descargando resumen: ${item.source}`);
            }
        }
        
        function deleteHistoryItem(id) {
            historyItems = historyItems.filter(i => i.id !== id);
            localStorage.setItem('history', JSON.stringify(historyItems));
            renderHistory();
            showNotification('Resumen eliminado del historial');
        }
  