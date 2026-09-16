import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import { colors } from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState(''); // formato DD/MM/AAAA
  const [studentId, setStudentId] = useState(''); // carnet institucional
  const [imageUrl, setImageUrl] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Campo obligatorio';
    if (!birthDate.trim()) newErrors.birthDate = 'Campo obligatorio';
    if (!studentId.trim()) newErrors.studentId = 'Campo obligatorio';
    if (!imageUrl.trim()) newErrors.imageUrl = 'Campo obligatorio';
    if (!email.trim()) newErrors.email = 'Campo obligatorio';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Correo inválido';
    if (!password) newErrors.password = 'Campo obligatorio';
    else if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    setAuthError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = credential.user.uid;

      // Perfil del usuario en la colección 'usuarios', indexado por su UID
      await setDoc(doc(db, 'usuarios', uid), {
        nombreCompleto: fullName.trim(),
        fechaNacimiento: birthDate.trim(),
        carnetInstitucional: studentId.trim(),
        urlImagen: imageUrl.trim(),
        email: email.trim(),
        creadoEn: new Date().toISOString(),
      });
      // La navegación a Dashboard la maneja el listener de auth en AppNavigator
    } catch (error) {
      // Se registra el error completo en consola para facilitar el diagnóstico
      console.log('Error en registro >>', error.code, '|', error.message);
      setAuthError(mapAuthError(error.code) + ` [${error.code || 'sin-codigo'}]`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Completa tus datos para registrarte</Text>

        <CustomCard style={styles.card}>
          <CustomInput
            label="Nombre completo"
            placeholder="Juan Pérez López"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            error={errors.fullName}
          />
          <CustomInput
            label="Fecha de nacimiento"
            placeholder="DD/MM/AAAA"
            value={birthDate}
            onChangeText={setBirthDate}
            error={errors.birthDate}
          />
          <CustomInput
            label="Carnet institucional"
            placeholder="00000000"
            value={studentId}
            onChangeText={setStudentId}
            error={errors.studentId}
          />
          <CustomInput
            label="URL de imagen de perfil"
            placeholder="https://..."
            value={imageUrl}
            onChangeText={setImageUrl}
            error={errors.imageUrl}
          />
          <CustomInput
            label="Correo electrónico"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={errors.email}
          />
          <CustomInput
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />
          <CustomInput
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={errors.confirmPassword}
          />

          {authError ? <Text style={styles.authError}>{authError}</Text> : null}

          <CustomButton title="Registrarme" onPress={handleRegister} loading={loading} />

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta? <Text style={styles.linkBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </CustomCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function mapAuthError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Ese correo ya está registrado';
    case 'auth/invalid-email':
      return 'El formato del correo no es válido';
    case 'auth/weak-password':
      return 'La contraseña es muy débil';
    case 'auth/operation-not-allowed':
      return 'Habilita Email/Password en Firebase Authentication';
    case 'auth/network-request-failed':
      return 'Sin conexión con Firebase. Revisa la red o las credenciales';
    case 'auth/invalid-api-key':
      return 'La API Key del archivo .env no es válida';
    case 'permission-denied':
      return 'Firestore rechazó la escritura. Revisa las reglas de seguridad';
    case 'unavailable':
      return 'No se pudo conectar con Firestore. ¿Creaste la base de datos?';
    default:
      return 'Ocurrió un error al registrarte';
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.primary },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.surface,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.secondary,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.background,
  },
  authError: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 13,
  },
  linkContainer: {
    marginTop: 18,
    alignItems: 'center',
  },
  linkText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  linkBold: {
    color: colors.accent,
    fontWeight: '700',
  },
});
