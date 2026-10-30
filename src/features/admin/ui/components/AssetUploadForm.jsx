import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS, ADMIN_FONTS } from '../../theme';

const ROSE = '#C65D7B';

export default function AssetUploadForm({ onUpload, isUploading }) {
  const inputRef = useRef(null);
  const [error, setError] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    onUpload(file).catch((err) => setError(err.message));
    e.target.value = '';
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        style={({ hovered, pressed }) => [
          styles.uploadBtn,
          (hovered || pressed) && !isUploading && styles.uploadBtnHover,
          isUploading && styles.uploadBtnDisabled,
        ]}
        onPress={() => !isUploading && inputRef.current?.click()}
      >
        <Ionicons name="cloud-upload-outline" size={17} color="#FFFFFF" />
        <Text style={styles.uploadBtnText}>{isUploading ? 'Uploading…' : 'Upload Image'}</Text>
      </Pressable>
      {/* Native <input> for web — this admin panel is web-only, so no RN Platform check needed */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color={ADMIN_COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ROSE,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  uploadBtnHover: { opacity: 0.9 },
  uploadBtnDisabled: { opacity: 0.5 },
  uploadBtnText: { fontFamily: ADMIN_FONTS.body, fontSize: 13, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fdecea',
    borderWidth: 1,
    borderColor: 'rgba(217,83,79,0.25)',
  },
  errorText: { fontFamily: ADMIN_FONTS.body, fontSize: 12, color: ADMIN_COLORS.danger },
});