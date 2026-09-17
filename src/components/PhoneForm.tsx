import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  KeyboardTypeOptions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Phone } from '@/types/phone';
import { colors, font, radius, space } from '@/constants/instrument';

export type PhoneFormValues = Omit<Phone, 'id'>;

interface PhoneFormProps {
  initial?: Partial<PhoneFormValues>;
  submitLabel: string;
  onSubmit: (values: PhoneFormValues, imageUri?: string) => Promise<boolean>;
  onSuccess: () => void;
  successMessage: string;
}

function Field({
  index,
  label,
  required,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  autoCapitalize,
}: {
  index: string;
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.labelIdx}>{index}</Text>
        <Text style={styles.label}>{label}</Text>
        {required ? <Text style={styles.req}>REQ</Text> : <Text style={styles.opt}>OPT</Text>}
      </View>
      <TextInput
        style={[styles.input, multiline && styles.textArea, focused && styles.inputFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMute}
        selectionColor={colors.accent}
        cursorColor={colors.accent}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

export default function PhoneForm({
  initial,
  submitLabel,
  onSubmit,
  onSuccess,
  successMessage,
}: PhoneFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [brand, setBrand] = useState(initial?.brand ?? '');
  const [model, setModel] = useState(initial?.model ?? '');
  const [price, setPrice] = useState(
    initial?.price !== undefined ? String(initial.price) : ''
  );
  const [description, setDescription] = useState(initial?.description ?? '');
  // Already-hosted image (edit mode); passed through unless replaced/removed.
  const [existingUrl, setExistingUrl] = useState(initial?.image_url ?? '');
  // Newly picked local file (device URI), uploaded on submit.
  const [pickedUri, setPickedUri] = useState<string | undefined>(undefined);
  const [pickedError, setPickedError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const previewUri = pickedUri ?? (existingUrl && !existingUrl.startsWith('data:') ? existingUrl : '');
  const hasImage = !!previewUri && !pickedError;

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to attach an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.6,
    });
    if (!result.canceled) {
      setPickedUri(result.assets[0].uri);
      setPickedError(false);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.6,
    });
    if (!result.canceled) {
      setPickedUri(result.assets[0].uri);
      setPickedError(false);
    }
  };

  const removeImage = () => {
    setPickedUri(undefined);
    setExistingUrl('');
    setPickedError(false);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !brand.trim() || !model.trim() || !price.trim()) {
      Alert.alert('Validation', 'Fill in all required fields: Name, Brand, Model, Price.');
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Validation', 'Enter a valid price greater than zero.');
      return;
    }

    setSubmitting(true);
    const ok = await onSubmit(
      {
        name: name.trim(),
        brand: brand.trim(),
        model: model.trim(),
        price: parsedPrice,
        description: description.trim(),
        image_url: existingUrl.trim(),
      },
      pickedUri
    );
    setSubmitting(false);

    if (ok) {
      Alert.alert('Success', successMessage, [{ text: 'OK', onPress: onSuccess }]);
    } else {
      Alert.alert('Error', 'Request failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.formKicker}>◇ DATA ENTRY / FILL ALL REQUIRED FIELDS</Text>

        <Field index="01" label="NAME" required value={name} onChangeText={setName} placeholder="Galaxy S24 Ultra" />
        <Field index="02" label="BRAND" required value={brand} onChangeText={setBrand} placeholder="Samsung" />
        <Field index="03" label="MODEL" required value={model} onChangeText={setModel} placeholder="SM-S928B" />
        <Field index="04" label="PRICE · PHP" required value={price} onChangeText={setPrice} placeholder="74999.00" keyboardType="numeric" />
        <Field index="05" label="DESCRIPTION" value={description} onChangeText={setDescription} placeholder="Unit notes, specs, condition…" multiline />

        {/* Image control */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.labelIdx}>06</Text>
            <Text style={styles.label}>IMAGE</Text>
            <Text style={styles.opt}>OPT</Text>
          </View>

          {hasImage && (
            <View style={styles.previewFrame}>
              <Image
                source={{ uri: previewUri }}
                style={styles.previewImage}
                resizeMode="cover"
                onError={() => setPickedError(true)}
              />
              <View style={styles.previewTag}>
                <Text style={styles.previewTagText}>
                  {pickedUri ? 'NEW UPLOAD' : 'CURRENT'}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.imageButtons}>
            <Pressable
              style={({ pressed }) => [styles.imgBtn, pressed && styles.imgBtnPressed]}
              onPress={pickFromLibrary}
            >
              <Text style={styles.imgBtnText}>⌾ GALLERY</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.imgBtn, pressed && styles.imgBtnPressed]}
              onPress={takePhoto}
            >
              <Text style={styles.imgBtnText}>◉ CAMERA</Text>
            </Pressable>
            {hasImage && (
              <Pressable
                style={({ pressed }) => [styles.imgBtn, styles.imgBtnDanger, pressed && styles.imgBtnPressed]}
                onPress={removeImage}
              >
                <Text style={[styles.imgBtnText, styles.imgBtnTextDanger]}>✕ REMOVE</Text>
              </Pressable>
            )}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submit,
            submitting && styles.submitDisabled,
            pressed && !submitting && styles.submitPressed,
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.onAccent} size="small" />
          ) : (
            <>
              <Text style={styles.submitGlyph}>▸</Text>
              <Text style={styles.submitText}>{submitLabel}</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: space.xl, paddingBottom: space.xxxl },
  formKicker: {
    color: colors.accent,
    fontFamily: font.monoMed,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: space.xl,
  },
  field: { marginBottom: space.xl },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.sm },
  labelIdx: { color: colors.textMute, fontFamily: font.mono, fontSize: 11, letterSpacing: 1 },
  label: { color: colors.text, fontFamily: font.monoSemi, fontSize: 12, letterSpacing: 2, flex: 1 },
  req: { color: colors.accent, fontFamily: font.monoBold, fontSize: 9, letterSpacing: 1.5 },
  opt: { color: colors.textMute, fontFamily: font.mono, fontSize: 9, letterSpacing: 1.5 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    color: colors.text,
    fontFamily: font.monoMed,
    fontSize: 15,
  },
  inputFocused: { borderColor: colors.accentLine, backgroundColor: colors.surface2 },
  textArea: { minHeight: 104, paddingTop: space.md },
  previewFrame: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: space.md,
  },
  previewImage: { width: '100%', height: 200 },
  previewTag: {
    position: 'absolute',
    left: space.sm,
    bottom: space.sm,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.accentLine,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  previewTagText: { color: colors.accent, fontFamily: font.monoBold, fontSize: 9, letterSpacing: 1.5 },
  imageButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  imgBtn: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
  },
  imgBtnPressed: { borderColor: colors.accentLine, backgroundColor: colors.surface2 },
  imgBtnDanger: { borderColor: colors.line },
  imgBtnText: { color: colors.text, fontFamily: font.monoSemi, fontSize: 12, letterSpacing: 1.5 },
  imgBtnTextDanger: { color: colors.danger },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: space.lg,
    marginTop: space.sm,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  submitDisabled: { opacity: 0.6 },
  submitPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  submitGlyph: { color: colors.onAccent, fontFamily: font.monoBold, fontSize: 15 },
  submitText: { color: colors.onAccent, fontFamily: font.monoBold, fontSize: 14, letterSpacing: 2 },
});
