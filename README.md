# - Evaluación Móviles

Aplicación móvil desarrollada con **React Native** y **Expo** que implementa autenticación de usuarios mediante **Firebase Auth** y almacenamiento de datos en **Cloud Firestore**. Cuenta con tres pantallas principales: Login, Registro y Dashboard (perfil), navegación condicional según el estado de sesión, componentes reutilizables (input, botón, tarjeta) y manejo seguro de credenciales mediante variables de entorno.

---

##  Estudiantes

* **Joshua Gilberto Marinero Hernández**
* **Génesis Gómez Moya**

---

##  Dependencias Utilizadas

* **Core:** `expo` ~54.0.36 (SDK 54), `react` 19.1.0, `react-native` 0.81.5
* **Navegación:** `@react-navigation/native` ^7.3.18, `native-stack` ^7.18.10
* **UI & Interacción:** `react-native-screens` ~4.16.0, `react-native-safe-area-context` ~5.6.0, `react-native-gesture-handler` ~2.28.0
* **Backend & Almacenamiento:** `firebase` ^12.18.0 (Auth + Firestore)
* **Persistencia de sesión:** `@react-native-async-storage/async-storage` 2.2.0
* **Utilidades de Expo & Entorno:** `expo-splash-screen` ~31.0.13, `expo-status-bar` ~3.0.9, `expo-constants` ~18.0.14, `react-native-dotenv` ^4.1.1

---

##  Paleta de Colores — "Nocturno Ámbar"

| Color | Hex | Uso |
| :--- | :--- | :--- |
| **Navy oscuro** | `#10132A` | Fondo principal / headers |
| **Ámbar** | `#FFB347` | Botones y acciones principales |
| **Teal** | `#2DD4BF` | Elementos secundarios |
| **Fondo claro** | `#F7F5FB` | Fondo de tarjetas / pantallas |
| **Texto** | `#1E1B2E` | Texto principal |

---

##  Configuración del Proyecto

### 1. Instalar dependencias
```bash
npm install

cp .env.example .env
En la consola de Firebase: habilitar Authentication > Email/Password y crear la base de Firestore.

Reglas de seguridad de Firestore:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
Ejecutar limpiando caché:

npx expo start -c
Estructura del proyecto
├── index.js
├── App.js
├── app.json
├── babel.config.js
├── .env / .env.example
├── assets/
│   ├── icon.png
│   ├── splash-icon.png
│   ├── adaptive-icon.png
│   └── favicon.png
└── src/
    ├── components/        # CustomInput, CustomButton, CustomCard
    ├── context/           # AuthContext (estado global de sesion)
    ├── screens/           # LoginScreen, RegisterScreen, DashboardScreen
    ├── navigation/        # AppNavigator
    ├── config/            # firebaseConfig
    └── theme/             # colors
```

---

Estructura de datos en Firestore (colección usuarios)
| Campo | Tipo |
| :--- | :--- |
| `nombreCompleto` | `string` |
| `fechaNacimiento` | `string` |
| `carnetInstitucional` | `string` |
| `urlImagen` | `string` |
| `email` | `string` |
| `creadoEn` | `string` (ISO date) |
