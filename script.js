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

    // Actualizar navegación activa
    updateActiveNav(activeItem) {
        this.navItems.forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');
    }

    // Poblar selectores de fecha
    populateDateSelectors() {
        this.populateDays();
        this.populateMonths();
        this.populateYears();
    }

    // Poblar días
    populateDays() {
        const daySelectors = document.querySelectorAll('#dia-nac, #dia-calc, #dia-ingreso');
        
        daySelectors.forEach(selector => {
            for (let day = 1; day <= 31; day++) {
                const option = document.createElement('option');
                option.value = day;
                option.textContent = day;
                selector.appendChild(option);
            }
        });
    }

    // Poblar meses
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

    // Poblar años
    populateYears() {
        const currentYear = new Date().getFullYear();
        const yearSelectors = document.querySelectorAll('#ano-nac, #ano-calc, #ano-ingreso');
        
        yearSelectors.forEach(selector => {
            for (let year = currentYear; year >= currentYear - 120; year--) {
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
            tallaInput.addEventListener('input', () => {
                this.calculateIMC();
                this.calculateContextura();
            });
            tallaInput.addEventListener('change', () => {
                this.calculateIMC();
                this.calculateContextura();
            });
            tallaInput.addEventListener('keyup', () => {
                this.calculateIMC();
                this.calculateContextura();
            });
        }

        // Cambios en porcentaje de grasa Omron para calcular clasificación automáticamente
        const pcInput = document.getElementById('pc');
        if (pcInput) {
            pcInput.addEventListener('input', () => this.calculateOmronClassification());
            pcInput.addEventListener('change', () => this.calculateOmronClassification());
            pcInput.addEventListener('keyup', () => this.calculateOmronClassification());
        }

        // Cambios en circunferencia de muñeca para calcular contextura automáticamente
        const munecaInput = document.getElementById('muneca');
        if (munecaInput) {
            munecaInput.addEventListener('input', () => this.calculateContextura());
            munecaInput.addEventListener('change', () => this.calculateContextura());
            munecaInput.addEventListener('keyup', () => this.calculateContextura());
        }

        // Event listeners para sexo (afectan tanto grasa Omron como contextura e ICC)
        const sexoInputs = document.querySelectorAll('input[name="sexo"]');
        sexoInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.calculateOmronClassification();
                this.calculateContextura();
                this.calculateICC();
            });
        });

        // Cambios en circunferencia de cintura y cadera para calcular ICC automáticamente
        const cinturaInput = document.getElementById('cintura');
        if (cinturaInput) {
            cinturaInput.addEventListener('input', () => this.calculateICC());
            cinturaInput.addEventListener('change', () => this.calculateICC());
            cinturaInput.addEventListener('keyup', () => this.calculateICC());
        }

        const caderaInput = document.getElementById('cadera');
        if (caderaInput) {
            caderaInput.addEventListener('input', () => this.calculateICC());
            caderaInput.addEventListener('change', () => this.calculateICC());
            caderaInput.addEventListener('keyup', () => this.calculateICC());
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
            
            // Recalcular clasificaciones que dependen de la edad
            this.calculateOmronClassification();
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

    // Calcular contextura corporal automáticamente
    calculateContextura() {
        const tallaInput = document.getElementById('longitud');
        const munecaInput = document.getElementById('muneca');
        const contexturaField = document.getElementById('contextura');

        // Verificar que los elementos existan
        if (!tallaInput || !munecaInput || !contexturaField) {
            return;
        }

        const talla = parseFloat(tallaInput.value);
        const muneca = parseFloat(munecaInput.value);

        // Verificar que ambos valores sean válidos y mayores que 0
        if (talla && muneca && talla > 0 && muneca > 0) {
            const indiceContextura = talla / muneca;
            const clasificacion = this.getContexturaClassification(indiceContextura);
            contexturaField.value = `${indiceContextura.toFixed(2)} (${clasificacion})`;
        } else {
            contexturaField.value = '';
        }
    }

    // Obtener clasificación de contextura corporal
    getContexturaClassification(indice) {
        // Obtener sexo del usuario
        const sexoInputs = document.querySelectorAll('input[name="sexo"]:checked');
        const sexo = sexoInputs.length > 0 ? sexoInputs[0].value : '';
        if (!sexo) {
            return 'Sexo requerido';
        }

        if (sexo === 'hombre') {
            if (indice > 10.4) return 'Pequeña';
            if (indice > 9.8) return 'Delgada';
            if (indice > 9.0) return 'Normal';
            if (indice > 8.2) return 'Media';
            if (indice > 7.4) return 'Robusta';
            return 'Muy Robusta';
        } else if (sexo === 'mujer') {
            if (indice > 13.7) return 'Pequeña';
            if (indice > 12.9) return 'Delgada';
            if (indice > 12.0) return 'Normal';
            if (indice > 11.1) return 'Media';
            if (indice > 10.1) return 'Robusta';
            return 'Muy Robusta';
        }

        return 'Datos insuficientes';
    }

    // Calcular ICC (Índice Cintura-Cadera) automáticamente
    calculateICC() {
        const cinturaInput = document.getElementById('cintura');
        const caderaInput = document.getElementById('cadera');
        const iccField = document.getElementById('icc');

        // Verificar que los elementos existan
        if (!cinturaInput || !caderaInput || !iccField) {
            return;
        }

        const cintura = parseFloat(cinturaInput.value);
        const cadera = parseFloat(caderaInput.value);

        // Verificar que ambos valores sean válidos y mayores que 0
        if (cintura && cadera && cintura > 0 && cadera > 0) {
            const icc = cintura / cadera;
            const clasificacion = this.getICCClassification(icc);
            iccField.value = `${icc.toFixed(3)} (${clasificacion})`;
        } else {
            iccField.value = '';
        }
    }

    // Obtener clasificación de ICC
    getICCClassification(icc) {
        // Obtener sexo del usuario
        const sexoInputs = document.querySelectorAll('input[name="sexo"]:checked');
        const sexo = sexoInputs.length > 0 ? sexoInputs[0].value : '';

        // Si no tenemos sexo, no podemos clasificar
        if (!sexo) {
            return 'Sexo requerido';
        }

        if (sexo === 'hombre') {
            if (icc > 1.00) return 'Androide';
            if (icc >= 0.85) return 'Mixta';
            return 'Ginoide';
        } else if (sexo === 'mujer') {
            if (icc > 0.90) return 'Androide';
            if (icc >= 0.75) return 'Mixta';
            return 'Ginoide';
        }

        return 'Datos insuficientes';
    }

    // Calcular clasificación de grasa Omron automáticamente
    calculateOmronClassification() {
        const pcInput = document.getElementById('pc');
        const omronField = document.getElementById('omron');

        // Verificar que los elementos existan
        if (!pcInput || !omronField) {
            return;
        }

        const grasaPorcentaje = parseFloat(pcInput.value);

        // Verificar que el valor sea válido
        if (grasaPorcentaje && grasaPorcentaje > 0) {
            const clasificacion = this.getOmronClassification(grasaPorcentaje);
            omronField.value = clasificacion;
        } else {
            omronField.value = '';
        }
    }

    // Obtener clasificación de grasa corporal según tabla Omron
    getOmronClassification(grasaPorcentaje) {
        // Obtener edad del usuario
        const edadField = document.getElementById('edad');
        let edad = 0;
        
        if (edadField && edadField.value) {
            // Extraer años de un string como "30 años, 5 meses, 2 días"
            const match = edadField.value.match(/(\d+)\s+años/);
            if (match) {
                edad = parseInt(match[1]);
            }
        }

        // Obtener sexo del usuario
        const sexoInputs = document.querySelectorAll('input[name="sexo"]:checked');
        const sexo = sexoInputs.length > 0 ? sexoInputs[0].value : '';

        // Si no tenemos edad o sexo, no podemos clasificar
        if (edad === 0 || !sexo) {
            return 'Datos insuficientes (edad y sexo requeridos)';
        }

        // Lógica de clasificación según tabla Omron
        if (sexo === 'mujer') {
            if (edad >= 20 && edad <= 39) {
                if (grasaPorcentaje >= 5 && grasaPorcentaje <= 20) return 'Bajo';
                if (grasaPorcentaje >= 21 && grasaPorcentaje <= 33) return 'Recomendado';
                if (grasaPorcentaje >= 34 && grasaPorcentaje <= 38) return 'Elevado';
                if (grasaPorcentaje > 38) return 'Muy elevado';
            } else if (edad >= 40 && edad <= 59) {
                if (grasaPorcentaje >= 5 && grasaPorcentaje <= 22) return 'Bajo';
                if (grasaPorcentaje >= 23 && grasaPorcentaje <= 34) return 'Recomendado';
                if (grasaPorcentaje >= 35 && grasaPorcentaje <= 40) return 'Elevado';
                if (grasaPorcentaje > 40) return 'Muy elevado';
            } else if (edad >= 60 && edad <= 79) {
                if (grasaPorcentaje >= 5 && grasaPorcentaje <= 23) return 'Bajo';
                if (grasaPorcentaje >= 24 && grasaPorcentaje <= 36) return 'Recomendado';
                if (grasaPorcentaje >= 37 && grasaPorcentaje <= 41) return 'Elevado';
                if (grasaPorcentaje > 41) return 'Muy elevado';
            }
        } else if (sexo === 'hombre') {
            if (edad >= 20 && edad <= 39) {
                if (grasaPorcentaje >= 5 && grasaPorcentaje <= 7) return 'Bajo';
                if (grasaPorcentaje >= 8 && grasaPorcentaje <= 20) return 'Recomendado';
                if (grasaPorcentaje >= 21 && grasaPorcentaje <= 25) return 'Elevado';
                if (grasaPorcentaje > 25) return 'Muy elevado';
            } else if (edad >= 40 && edad <= 59) {
                if (grasaPorcentaje >= 5 && grasaPorcentaje <= 10) return 'Bajo';
                if (grasaPorcentaje >= 11 && grasaPorcentaje <= 21) return 'Recomendado';
                if (grasaPorcentaje >= 22 && grasaPorcentaje <= 27) return 'Elevado';
                if (grasaPorcentaje > 27) return 'Muy elevado';
            } else if (edad >= 60 && edad <= 79) {
                if (grasaPorcentaje >= 5 && grasaPorcentaje <= 12) return 'Bajo';
                if (grasaPorcentaje >= 13 && grasaPorcentaje <= 25) return 'Recomendado';
                if (grasaPorcentaje >= 26 && grasaPorcentaje <= 30) return 'Elevado';
                if (grasaPorcentaje > 30) return 'Muy elevado';
            }
        }

        // Si la edad está fuera de los rangos soportados
        if (edad < 20) {
            return 'Edad < 20 años (fuera de rango de tabla)';
        } else if (edad > 79) {
            return 'Edad > 79 años (fuera de rango de tabla)';
        }

        // Valor fuera de rangos esperados
        return 'Valor fuera de rangos esperados';
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

// Instanciar y configurar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new CalculadoraNutricional();

    // Configurar botones principales
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

    // Modal de información IMC
    const imcInfoBtn = document.getElementById('imc-info-btn');
    const imcInfoModal = document.getElementById('imc-info-modal');
    const imcInfoClose = document.getElementById('imc-info-close');

    if (imcInfoBtn && imcInfoModal && imcInfoClose) {
        imcInfoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            app.showModal('imc-info-modal');
        });

        imcInfoClose.addEventListener('click', () => {
            app.hideModal('imc-info-modal');
        });

        // Cerrar modal al hacer clic fuera del contenido
        imcInfoModal.addEventListener('click', (e) => {
            if (e.target === imcInfoModal) {
                app.hideModal('imc-info-modal');
            }
        });
    }

    // Modal de información Contextura
    const contexturaInfoBtn = document.getElementById('contextura-info-btn');
    const contexturaInfoModal = document.getElementById('contextura-info-modal');
    const contexturaInfoClose = document.getElementById('contextura-info-close');

    if (contexturaInfoBtn && contexturaInfoModal && contexturaInfoClose) {
        contexturaInfoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            app.showModal('contextura-info-modal');
        });

        contexturaInfoClose.addEventListener('click', () => {
            app.hideModal('contextura-info-modal');
        });

        // Cerrar modal al hacer clic fuera del contenido
        contexturaInfoModal.addEventListener('click', (e) => {
            if (e.target === contexturaInfoModal) {
                app.hideModal('contextura-info-modal');
            }
        });
    }

    // Modal de información ICC
    const iccInfoBtn = document.getElementById('icc-info-btn');
    const iccInfoModal = document.getElementById('icc-info-modal');
    const iccInfoClose = document.getElementById('icc-info-close');

    if (iccInfoBtn && iccInfoModal && iccInfoClose) {
        iccInfoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            app.showModal('icc-info-modal');
        });

        iccInfoClose.addEventListener('click', () => {
            app.hideModal('icc-info-modal');
        });

        // Cerrar modal al hacer clic fuera del contenido
        iccInfoModal.addEventListener('click', (e) => {
            if (e.target === iccInfoModal) {
                app.hideModal('icc-info-modal');
            }
        });
    }

    // Cerrar modales con la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            app.hideModal('imc-info-modal');
            app.hideModal('contextura-info-modal');
            app.hideModal('icc-info-modal');
        }
    });
});