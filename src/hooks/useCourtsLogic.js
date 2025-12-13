import { useEffect, useState, useCallback, useMemo } from 'react';   // [cite: 199]
import { useAuth } from '../context/AuthContext';   // [cite: 199]
import { canchasApi } from '../api/canchas';   // [cite: 199]
import { espaciosApi } from '../api/espacios';   // [cite: 200]
import { toast } from 'react-toastify';   // [cite: 200]
import {
    SportsSoccer, 
    Block, 
    CheckCircle,
    AttachMoney
} from '@mui/icons-material';   // [cite: 202]

// === PALETA DE COLORES (Tomada de Courts.jsx para consistencia) ===
const COLOR_AZUL_ELECTRICO = '#00BFFF';   // [cite: 203]
const COLOR_VERDE_LIMA = '#A2E831';       // [cite: 204]
const COLOR_NARANJA_VIBRANTE = '#FD7E14';   // [cite: 204]
const COLOR_GRIS_OSCURO = '#333333';   // [cite: 205]
const COLOR_BLANCO = '#FFFFFF';   // [cite: 205]
const COLOR_NEGRO_SUAVE = '#212121';   // [cite: 205]

// ===================================================
// HOOK DE LÓGICA
// ===================================================
export const useCourtsLogic = () => {
    const { profile } = useAuth();   // [cite: 234]
    const [canchas, setCanchas] = useState([]);   // [cite: 234]
    const [espacios, setEspacios] = useState([]);   // [cite: 235]
    const [open, setOpen] = useState(false);   // [cite: 235]
    const [zoomOpen, setZoomOpen] = useState(false);   // [cite: 235]
    const [selectedImage, setSelectedImage] = useState('');   // [cite: 235]
    const [editing, setEditing] = useState(null);   // [cite: 236]
    
      // ESTADOS DE FILTRO [cite: 236]
    const [searchTerm, setSearchTerm] = useState('');   // [cite: 237]
    const [selectedTipo, setSelectedTipo] = useState('');   // [cite: 237]
    const [selectedEstado, setSelectedEstado] = useState('');   // [cite: 237, 238]
    const [selectedTime, setSelectedTime] = useState('');   // [cite: 238]
    const [sortPriceDirection, setSortPriceDirection] = useState('');   // [cite: 238, 239]
    // FIN ESTADOS DE FILTRO

      const [formData, setFormData] = useState({ // [cite: 239]
        nombre: '',
        tipo: '',
        hora_apertura: '08:00',
        hora_cierre: '22:00',
          precio_por_hora: '', // [cite: 247]
        id_espacio_deportivo: '',
        estado: 'disponible',
    });
    const [imageFile, setImageFile] = useState(null);   // [cite: 240]
    const api_url = import.meta.env.VITE_API_URL;   // [cite: 240]

    // ===================================================
    // FETCH DE DATOS
    // ===================================================
      const fetchData = useCallback(async () => { // [cite: 241]
        try {
            const canchasData = await canchasApi.getAll();   // [cite: 241, 242]
            const espaciosData = await espaciosApi.getAll();   // [cite: 242, 243]
            
            setCanchas(canchasData);   // [cite: 243]
            setEspacios(espaciosData);   // [cite: 244]
        } catch (error) {
            console.error('Error al cargar datos:', error);   // [cite: 244]
            toast.error('Error al cargar datos');   // [cite: 245]
        }
    }, []);

      useEffect(() => { // [cite: 240]
        fetchData();
    }, [profile, fetchData]);

    // ===================================================
    // MANEJO DE FORMULARIO
    // ===================================================
      const handleSubmit = async (e) => { // [cite: 245]
        e.preventDefault();   // [cite: 246]
        try {
            const submitData = new FormData();   // [cite: 246]
            submitData.append('nombre', formData.nombre);
            submitData.append('tipo', formData.tipo);
            submitData.append('hora_apertura', formData.hora_apertura);
            submitData.append('hora_cierre', formData.hora_cierre);
            submitData.append('precio_por_hora', formData.precio_por_hora);   // [cite: 247]
            submitData.append('id_espacio_deportivo', formData.id_espacio_deportivo);
            submitData.append('estado', formData.estado);
            
              if (imageFile instanceof File) { // [cite: 247]
                submitData.append('imagen', imageFile);   // [cite: 248]
            } else if (editing && imageFile === null) {
                // Aquí se podría añadir lógica para eliminar imagen si el backend lo requiere
            } 

              if (editing) { // [cite: 249]
                await canchasApi.update(editing.id_cancha, submitData);   // [cite: 249]
                toast.success('Cancha actualizada correctamente');   // [cite: 250]
            } else {
                await canchasApi.create(submitData);   // [cite: 250]
                toast.success('Cancha creada correctamente');   // [cite: 251]
            }

            handleClose();   // [cite: 251]
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error al guardar la cancha');   // [cite: 252]
        }
    };

      const handleEdit = (cancha) => { // [cite: 252]
        setEditing(cancha);   // [cite: 253]
          setFormData({ // [cite: 253]
            nombre: cancha.nombre,
            tipo: cancha.tipo || '',
            hora_apertura: cancha.hora_apertura.slice(0, 5),
            hora_cierre: cancha.hora_cierre.slice(0, 5),
            precio_por_hora: cancha.precio_por_hora,
            id_espacio_deportivo: cancha.id_espacio_deportivo.toString(),
            estado: cancha.estado,
        });
        setImageFile(cancha.imagen || null);   // [cite: 254]
        setOpen(true);   // [cite: 254]
    };

      const handleDelete = async (id) => { // [cite: 255]
          if (window.confirm('¿Estás seguro de eliminar esta cancha? Esta acción es permanente.')) { // [cite: 255]
            try {
                await canchasApi.delete(id);   // [cite: 256]
                toast.success('Cancha eliminada correctamente');   // [cite: 256]
                fetchData();
            } catch (error) {
                toast.error(error.response?.data?.detail || 'Error al eliminar la cancha');   // [cite: 257]
            }
        }
    };

      const handleDesactivar = async (id) => { // [cite: 257]
          if (window.confirm('¿Estás seguro de desactivar esta cancha y marcarla como inactiva?')) { // [cite: 257]
            try {
                await canchasApi.desactivar(id);   // [cite: 258]
                toast.success('Cancha desactivada/marcada como inactiva');   // [cite: 258]
                fetchData();
            } catch (error) {
                toast.error('Error al desactivar la cancha');   // [cite: 259]
            }
        }
    };

      const handleActivar = async (id) => { // [cite: 259]
        try {
            await canchasApi.activar(id);   // [cite: 260]
            toast.success('Cancha activada correctamente');   // [cite: 260]
            fetchData();
        } catch (error) {
            toast.error('Error al activar la cancha');   // [cite: 261]
        }
    };

      const handleClose = () => { // [cite: 261]
        setOpen(false);   // [cite: 262]
        setEditing(null);   // [cite: 262]
          setFormData({ // [cite: 262]
            nombre: '',
            tipo: '',
            hora_apertura: '08:00',
            hora_cierre: '22:00',
            precio_por_hora: '',
            id_espacio_deportivo: '',
              estado: 'disponible', // [cite: 263]
        });
        setImageFile(null);   // [cite: 263]
    };

      const handleImageZoom = (imageUrl) => { // [cite: 263]
        setSelectedImage(imageUrl);   // [cite: 264]
        setZoomOpen(true);
    };

    // ===================================================
    // FUNCIONES AUXILIARES (Icons, Colors, Names)
    // ===================================================

      const getSportIcon = (tipo) => { // [cite: 264]
        const icons = {
            'Fútbol': '⚽',
            'Básquetbol': '🏀',
            'Tenis': '🎾',
            'Vóleibol': '🏐',
            'Rugby': '🏉',
            'Béisbol': '⚾',
            'Hockey': '🏒',
            'Ping Pong': '🏓',
            'Boxeo': '🥊',
            'Billar': '🎱',
            'Natación': '🏊',
              'Atletismo': '🏃' // [cite: 265]
        };
        return icons[tipo] || '🏆';   // [cite: 265]
    };

      const getEstadoColor = (estado) => { // [cite: 265]
        switch(estado) {
            case 'disponible':
                return COLOR_VERDE_LIMA;   // [cite: 266]
            case 'mantenimiento':
                return COLOR_NARANJA_VIBRANTE;   // [cite: 266, 267]
            case 'inactiva':
                return COLOR_GRIS_OSCURO;   // [cite: 267, 268]
            default:
                return COLOR_GRIS_OSCURO;   // [cite: 268]
        }
    };

      const getEstadoText = (estado) => { // [cite: 269]
        const texts = {
            
            'disponible': 'DISPONIBLE',
            'mantenimiento': 'MANTENIMIENTO',
            'inactiva': 'INACTIVA'
        };
        return texts[estado] || estado.toUpperCase();   // [cite: 270]
    };

      const getEspacioNombre = (idEspacio) => { // [cite: 270]
        if (!idEspacio) return 'Sin espacio asignado';   // [cite: 271]
        const espacio = espacios.find(e => e.id_espacio_deportivo === parseInt(idEspacio));   // [cite: 271]
        return espacio ? espacio.nombre : 'Espacio no encontrado';   // [cite: 271]
    };

    // ===================================================
    // LÓGICA DE FILTRADO Y ORDENAMIENTO (Usando useMemo para optimización)
    // ===================================================
      const tipoDeportes = useMemo(() => // [cite: 272]
        Array.from(new Set(canchas.map(c => c.tipo))).filter(tipo => tipo), 
        [canchas]
    );

      const filteredCanchas = useMemo(() => { // [cite: 273]
        let filtered = canchas
            .filter(cancha => {
                // 1. Filtro de Texto (nombre y tipo)
                const matchesSearchTerm = searchTerm === '' || 
                    (cancha.nombre && cancha.nombre.toLowerCase().includes(searchTerm.toLowerCase())) || 
                    (cancha.tipo && cancha.tipo.toLowerCase()  .includes(searchTerm.toLowerCase())); // [cite: 273]

                // 2. Filtro por Tipo de Deporte
                const matchesTipo = selectedTipo === '' || cancha.tipo === selectedTipo;

                // 3. Filtro por Estado
                const matchesEstado = selectedEstado === '' || cancha.estado === selectedEstado;   // [cite: 274]

                // 4. Filtro por Hora
                let matchesTime = true;
                  if (selectedTime) { // [cite: 274]
                    const [hours, minutes] = selectedTime.split(':').map(Number);
                    const selectedMinutes = hours * 60 + minutes;   // [cite: 275]
                    
                    const aperturaTime = cancha.hora_apertura;   // [cite: 276]
                    const [aperturaHours, aperturaMinutes] = typeof aperturaTime === 'string' 
                          ? aperturaTime.split(':').map(Number) // [cite: 277]
                        : [aperturaTime.getHours ? aperturaTime.getHours() : 8, aperturaTime.getMinutes ? aperturaTime.getMinutes() : 0];   // [cite: 278]
                    const aperturaMinutesTotal = aperturaHours * 60 + aperturaMinutes;   // [cite: 279]
                    
                    const cierreTime = cancha.hora_cierre;   // [cite: 279, 280]
                    const [cierreHours, cierreMinutes] = typeof cierreTime === 'string'
                          ? cierreTime.split(':').map(Number) // [cite: 281]
                        : [cierreTime.getHours ? cierreTime.getHours() : 22, cierreTime.getMinutes ? cierreTime.getMinutes() : 0];   // [cite: 282]
                    const cierreMinutesTotal = cierreHours * 60 + cierreMinutes;   // [cite: 283]
                    
                    matchesTime = selectedMinutes >= aperturaMinutesTotal && 
                                  selectedMinutes < cierreMinutesTotal;   // [cite: 283]
                }
                
                return matchesSearchTerm && matchesTipo && matchesEstado && matchesTime;   // [cite: 284]
            });

        // Aplicar ordenamiento
          filtered.sort((a, b) => { // [cite: 285]
            if (sortPriceDirection === '') return 0;   // [cite: 285]
            
            const priceA = parseFloat(a.precio_por_hora) || 0;
            const priceB = parseFloat(b.precio_por_hora) || 0;
            
              if (sortPriceDirection === 'asc') { // [cite: 285]
                return priceA - priceB;
              } else if (sortPriceDirection === 'desc') { // [cite: 286]
                return priceB - priceA;
            }
            return 0;   // [cite: 286]
        });

        return filtered;   // [cite: 287]

    }, [canchas, searchTerm, selectedTipo, selectedEstado, selectedTime, sortPriceDirection]);

    return {
        // Colores y Constantes
        COLOR_AZUL_ELECTRICO,
        COLOR_VERDE_LIMA,
        COLOR_NARANJA_VIBRANTE,
        COLOR_GRIS_OSCURO,
        COLOR_BLANCO,
        COLOR_NEGRO_SUAVE,
        api_url,
        SportsSoccer,
        Block,
        CheckCircle,
        AttachMoney,

        // Estados
        canchas,
        espacios,
        open,
        zoomOpen,
        selectedImage,
        editing,
        formData,
        imageFile,
        searchTerm,
        selectedTipo,
        selectedEstado,
        selectedTime,
        sortPriceDirection,
        filteredCanchas,
        tipoDeportes,

        // Setters para formulario y filtros
        setOpen,
        setZoomOpen,
        setSelectedImage,
        setFormData,
        setImageFile,
        setSearchTerm,
        setSelectedTipo,
        setSelectedEstado,
        setSelectedTime,
        setSortPriceDirection,
        
        // Handlers y Fetch
        fetchData,
        handleSubmit,
        handleEdit,
        handleDelete,
        handleDesactivar,
        handleActivar,
        handleClose,
        handleImageZoom,
        
        // Funciones Auxiliares
        getSportIcon,
        getEstadoColor,
        getEstadoText,
        getEspacioNombre,
    };
};