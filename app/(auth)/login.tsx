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
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Fonts, Spacing, Radius } from '../../src/constants/theme';
import SunganoMark from '../../src/components/brand/SunganoMark';
import SunganoWordmark from '../../src/components/brand/SunganoWordmark';
import Button from '../../src/components/ui/Button';
import { useAuth } from '../../src/hooks/useAuth';
import { toast } from '../../src/utils/toast';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
  onRegister?: () => void;
}

export default function LoginScreen({ onLoginSuccess, onRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address.', 'Missing email');
      return;
    }
    if (!password) {
      toast.error('Please enter your password.', 'Missing password');
      return;
    }
    try {
      await login(email.trim(), password);
      onLoginSuccess?.();
    } catch {
      toast.error('Invalid email or password.', 'Login failed');
    }
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const handleRegister = () => {
    if (onRegister) {
      onRegister();
    } else {
      router.push('/(auth)/register');
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
          <SunganoMark size={72} color={Colors.white} strokeWidth={3} />
          <SunganoWordmark color={Colors.white} size={30} />
          <Text style={styles.tagline}>Keep your word.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.welcomeTitle}>Welcome back</Text>
          <Text style={styles.welcomeSub}>Sign in to your account</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={Colors.textLight}
              style={styles.input}
              autoComplete="email"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textLight}
                style={[styles.input, styles.passwordInput]}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            label={isLoading ? 'Signing in...' : 'Sign In'}
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            size="lg"
            style={styles.loginBtn}
          />

          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Create one</Text>
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
    paddingTop: 80,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  tagline: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 16,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.2,
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
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeBtn: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  eyeText: {
    fontSize: 18,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
  },
  forgotText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.greenDeep,
  },
  loginBtn: {
    marginTop: Spacing.sm,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  registerPrompt: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textMed,
  },
  registerLink: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.greenDeep,
  },
});
