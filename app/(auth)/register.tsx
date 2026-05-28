import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '../../src/constants/theme';
import SunganoMark from '../../src/components/brand/SunganoMark';
import SunganoWordmark from '../../src/components/brand/SunganoWordmark';
import Button from '../../src/components/ui/Button';
import { useAuth } from '../../src/hooks/useAuth';

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onLogin?: () => void;
}

export default function RegisterScreen({ onRegisterSuccess, onLogin }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const { register, isLoading } = useAuth();

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (!agreed) {
      Alert.alert('Error', 'Please agree to the Terms of Service.');
      return;
    }
    try {
      await register(name, phone, password);
      onRegisterSuccess();
    } catch {
      Alert.alert('Registration Failed', 'Unable to create account. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <SunganoMark size={60} color={Colors.white} strokeWidth={3} />
          <SunganoWordmark color={Colors.white} size={26} />
        </View>

        <View style={styles.form}>
          <Text style={styles.welcomeTitle}>Create account</Text>
          <Text style={styles.welcomeSub}>Join your trusted savings network</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Amara Nwosu"
              placeholderTextColor={Colors.textLight}
              style={styles.input}
              autoComplete="name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+234 801 234 5678"
              placeholderTextColor={Colors.textLight}
              style={styles.input}
              autoComplete="tel"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="At least 8 characters"
              placeholderTextColor={Colors.textLight}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Repeat your password"
              placeholderTextColor={Colors.textLight}
              style={[styles.input, confirmPassword && password !== confirmPassword && styles.inputError]}
            />
          </View>

          <TouchableOpacity
            onPress={() => setAgreed(!agreed)}
            style={styles.termsRow}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <Button
            label={isLoading ? 'Creating account...' : 'Create Account'}
            onPress={handleRegister}
            loading={isLoading}
            disabled={!agreed}
            fullWidth
            size="lg"
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={onLogin}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.greenDeep,
  },
  scroll: {
    flexGrow: 1,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    gap: Spacing.md,
  },
  form: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
    gap: Spacing.lg,
  },
  welcomeTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 26,
    color: Colors.textDark,
  },
  welcomeSub: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
    color: Colors.textMed,
    marginTop: -Spacing.md,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  inputLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.textDark,
  },
  input: {
    backgroundColor: Colors.bgLight,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
    color: Colors.textDark,
  },
  inputError: {
    borderColor: Colors.red,
    backgroundColor: Colors.redBg,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.greenDeep,
    borderColor: Colors.greenDeep,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 13,
  },
  termsText: {
    flex: 1,
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.textMed,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.greenDeep,
    fontFamily: Fonts.bodySemiBold,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  loginPrompt: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textMed,
  },
  loginLink: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.greenDeep,
  },
});
