import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuthContext } from '../context/AuthContext';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import CustomCard from '../components/CustomCard';
import { colors } from '../theme/colors';

export default function DashboardScreen() {
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [studentId, setStudentId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [email, setEmail] = useState('');

  const { user, logout } = useAuthContext();

  useEffect(() => {
    if (!user) return;

    // Listener en tiempo real: evita que el perfil aparezca vacío justo
    // después del registro (el documento puede crearse milisegundos después
    // de que la sesión ya está activa) y refleja cambios al instante.
    const unsubscribe = onSnapshot(
      doc(db, 'usuarios', user.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setFullName(data.nombreCompleto || '');
          setBirthDate(data.fechaNacimiento || '');
          setStudentId(data.carnetInstitucional || '');
          setImageUrl(data.urlImagen || '');
          setEmail(data.email || user.email || '');
        } else {
          setEmail(user.email || '');
        }
        setLoadingData(false);
      },
      () => {
        Alert.alert('Error', 'No se pudo cargar la información del perfil');
        setLoadingData(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'usuarios', user.uid), {
        nombreCompleto: fullName.trim(),
        fechaNacimiento: birthDate.trim(),
        carnetInstitucional: studentId.trim(),
        urlImagen: imageUrl.trim(),
      });
      setEditMode(false);
      Alert.alert('Listo', 'Tu información se actualizó correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la información');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    // El contexto de autenticación redirige automáticamente a Login
  };

  if (loadingData) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Mi perfil</Text>

        <CustomCard style={styles.card}>
          <View style={styles.avatarWrapper}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]} />
            )}
          </View>

          <CustomInput
            label="Nombre completo"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            editable={editMode}
          />
          <CustomInput
            label="Fecha de nacimiento"
            value={birthDate}
            onChangeText={setBirthDate}
            editable={editMode}
          />
          <CustomInput
            label="Carnet institucional"
            value={studentId}
            onChangeText={setStudentId}
            editable={editMode}
          />
          <CustomInput
            label="URL de imagen"
            value={imageUrl}
            onChangeText={setImageUrl}
            editable={editMode}
          />
          <CustomInput label="Correo electrónico" value={email} editable={false} />

          {editMode ? (
            <CustomButton title="Guardar cambios" onPress={handleSave} loading={saving} />
          ) : (
            <CustomButton
              title="Editar información"
              variant="secondary"
              onPress={() => setEditMode(true)}
            />
          )}

          <View style={{ height: 12 }} />

          <CustomButton title="Cerrar sesión" variant="outline" onPress={handleLogout} />
        </CustomCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.primary },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 24,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.surface,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.background,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: colors.accent,
  },
  avatarPlaceholder: {
    backgroundColor: colors.border,
  },
});
