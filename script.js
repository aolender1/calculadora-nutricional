class CalculadoraNutricional {
    constructor() {
        this.sections = document.querySelectorAll('.section');
        this.navItems = document.querySelectorAll('.nav-item');
        this.init();
    }

    init() {
        this.setupNavigation();
        this.populateDateSelectors();
        this.setupEventListeners();
        this.setTodayDate();
        this.setupScrollSpy();
    }

    // Configurar navegación con smooth scroll
    setupNavigation() {
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = item.dataset.section;
                const targetElement = document.getElementById(targetSection);

                if (targetElement) {
                    // Smooth scroll to section
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Update active state immediately (will be confirmed by scroll spy)
                    this.updateActiveNav(item);
                }
            });
        });
    }

    // Configurar scroll spy
    setupScrollSpy() {
        const options = {
            root: null,
            rootMargin: '-20% 0px -70% 0px', // Trigger when section is 20% from top
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    const correspondingNavItem = document.querySelector(`[data-section="${sectionId}"]`);
                    if (correspondingNavItem) {
                        this.updateActiveNav(correspondingNavItem);
                    }
                }
            });
        }, options);

        // Observe all sections
        this.sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Actualizar elemento activo en la navegación
    updateActiveNav(activeItem) {
        this.navItems.forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');
    }

    // Poblar los selectores de fecha
    populateDateSelectors() {
        this.populateDays();
        this.populateMonths();
        this.populateYears();
    }

    populateDays() {
        const daySelectors = document.querySelectorAll('#dia-nac, #dia-calc, #dia-ingreso');

        daySelectors.forEach(selector => {
            for (let i = 1; i <= 31; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i.toString().padStart(2, '0');
                selector.appendChild(option);
            }
        });
    }

    populateMonths() {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const monthSelectors = document.querySelectorAll('#mes-nac, #mes-calc, #mes-ingreso');
        
        monthSelectors.forEach(selector => {
            months.forEach((month, index) => {
                const option = document.createElement('option');
                option.value = index + 1;
                option.textContent = month;
                selector.appendChild(option);
            });
        });
    }

    populateYears() {
        const currentYear = new Date().getFullYear();
        const yearSelectors = document.querySelectorAll('#ano-nac, #ano-calc, #ano-ingreso');

        yearSelectors.forEach(selector => {
            for (let year = currentYear; year >= currentYear - 100; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                selector.appendChild(option);
            }
        });
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botón "Hoy" para fecha de cálculo
        const btnTodayCalc = document.getElementById('btn-today-calc');
        if (btnTodayCalc) {
            btnTodayCalc.addEventListener('click', () => {
                this.setTodayDate();
                this.calculateAge();
            });
        }

        // Botón "Hoy" para fecha de ingreso
        const btnTodayIngreso = document.getElementById('btn-today-ingreso');
        if (btnTodayIngreso) {
            btnTodayIngreso.addEventListener('click', () => {
                this.setTodayIngresoDate();
            });
        }

        // Cambios en fecha de nacimiento y cálculo para calcular edad
        const dateInputs = document.querySelectorAll('#dia-nac, #mes-nac, #ano-nac, #dia-calc, #mes-calc, #ano-calc');
        dateInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.calculateAge();
            });
        });

        // Cambios en peso y talla para calcular IMC automáticamente
        const pesoInput = document.getElementById('peso');
        const tallaInput = document.getElementById('longitud');

        if (pesoInput) {
            // Múltiples eventos para asegurar la captura de cambios
            pesoInput.addEventListener('input', () => this.calculateIMC());
            pesoInput.addEventListener('change', () => this.calculateIMC());
            pesoInput.addEventListener('keyup', () => this.calculateIMC());
        }

        if (tallaInput) {
            // Múltiples eventos para asegurar la captura de cambios
            tallaInput.addEventListener('input', () => this.calculateIMC());
            tallaInput.addEventListener('change', () => this.calculateIMC());
            tallaInput.addEventListener('keyup', () => this.calculateIMC());
        }

        // Botones de borrar datos
        const clearButtons = document.querySelectorAll('.btn-clear');
        clearButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const section = e.target.closest('.section');
                this.clearSectionData(section);
            });
        });
    }

    // Establecer fecha de hoy en los selectores de fecha para cálculos
    setTodayDate() {
        const today = new Date();

        document.getElementById('dia-calc').value = today.getDate();
        document.getElementById('mes-calc').value = today.getMonth() + 1;
        document.getElementById('ano-calc').value = today.getFullYear();
    }

    // Establecer fecha de hoy en los selectores de fecha de ingreso
    setTodayIngresoDate() {
        const today = new Date();

        document.getElementById('dia-ingreso').value = today.getDate();
        document.getElementById('mes-ingreso').value = today.getMonth() + 1;
        document.getElementById('ano-ingreso').value = today.getFullYear();
    }

    // Calcular edad
    calculateAge() {
        const birthDay = parseInt(document.getElementById('dia-nac').value);
        const birthMonth = parseInt(document.getElementById('mes-nac').value);
        const birthYear = parseInt(document.getElementById('ano-nac').value);
        
        const calcDay = parseInt(document.getElementById('dia-calc').value);
        const calcMonth = parseInt(document.getElementById('mes-calc').value);
        const calcYear = parseInt(document.getElementById('ano-calc').value);

        if (birthDay && birthMonth && birthYear && calcDay && calcMonth && calcYear) {
            const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
            const calcDate = new Date(calcYear, calcMonth - 1, calcDay);
            
            let years = calcDate.getFullYear() - birthDate.getFullYear();
            let months = calcDate.getMonth() - birthDate.getMonth();
            let days = calcDate.getDate() - birthDate.getDate();

            if (days < 0) {
                months--;
                days += new Date(calcYear, calcMonth - 1, 0).getDate();
            }

            if (months < 0) {
                years--;
                months += 12;
            }

            const ageString = `${years} años, ${months} meses, ${days} días`;
            document.getElementById('edad').value = ageString;
        }
    }

    // Calcular IMC automáticamente
    calculateIMC() {
        const pesoInput = document.getElementById('peso');
        const tallaInput = document.getElementById('longitud');
        const imcField = document.getElementById('imc');
        const imcClasificacionField = document.getElementById('imc-clasificacion');

        // Verificar que los elementos existan
        if (!pesoInput || !tallaInput || !imcField || !imcClasificacionField) {
            return;
        }

        const peso = parseFloat(pesoInput.value);
        const talla = parseFloat(tallaInput.value);

        // Verificar que ambos valores sean válidos y mayores que 0
        if (peso && talla && peso > 0 && talla > 0) {
            const alturaMetros = talla / 100; // Convertir cm a metros
            const imc = peso / (alturaMetros * alturaMetros); // Fórmula IMC = peso(kg) / estatura(m)^2
            imcField.value = imc.toFixed(2);
            imcClasificacionField.value = this.getIMCClasificacion(imc);
        } else {
            imcField.value = '';
            imcClasificacionField.value = '';
        }
    }

    // Limpiar datos de una sección
    clearSectionData(section) {
        if (confirm('¿Está seguro de que desea borrar todos los datos de esta sección?')) {
            const inputs = section.querySelectorAll('input, select');
            inputs.forEach(input => {
                if (input.type === 'radio' || input.type === 'checkbox') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            });
        }
    }

    // Funciones para futuras implementaciones
    createReport() {
        // Implementar generación de informe
        alert('Función de crear informe en desarrollo');
    }

    downloadExcel() {
        // Implementar descarga de Excel
        alert('Función de descarga Excel en desarrollo');
    }

    getIMCClasificacion(imc) {
        if (imc <= 18.49) {
            return 'Bajo Peso';
        } else if (imc >= 18.50 && imc < 25) {
            return 'Peso Normal';
        } else if (imc >= 25 && imc < 30) {
            return 'Sobrepeso';
        } else if (imc >= 30 && imc < 35) {
            return 'Obesidad Leve';
        } else if (imc >= 35 && imc < 40) {
            return 'Obesidad Media';
        } else {
            return 'Obesidad Mórbida';
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    }
}

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    const app = new CalculadoraNutricional();

    // Event listeners para botones principales
    const btnPrimary = document.querySelector('.btn-primary');
    const btnSecondary = document.querySelector('.btn-secondary');

    if (btnPrimary) {
        btnPrimary.addEventListener('click', () => {
            app.createReport();
        });
    }

    if (btnSecondary) {
        btnSecondary.addEventListener('click', () => {
            app.downloadExcel();
        });
    }

    // Event listeners para el modal de información IMC
    const imcInfoBtn = document.getElementById('imc-info-btn');
    const imcInfoClose = document.getElementById('imc-info-close');
    const imcInfoModal = document.getElementById('imc-info-modal');

    if (imcInfoBtn) {
        imcInfoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            app.showModal('imc-info-modal');
        });
    }

    if (imcInfoClose) {
        imcInfoClose.addEventListener('click', () => {
            app.hideModal('imc-info-modal');
        });
    }

    // Cerrar modal al hacer clic fuera de él
    if (imcInfoModal) {
        imcInfoModal.addEventListener('click', (e) => {
            if (e.target === imcInfoModal) {
                app.hideModal('imc-info-modal');
            }
        });
    }

    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            app.hideModal('imc-info-modal');
        }
    });
});