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
import { toast } from '../../src/utils/toast';
import { router } from 'expo-router';
import { Colors, Fonts, Spacing, Radius } from '../../src/constants/theme';
import SunganoMark from '../../src/components/brand/SunganoMark';
import Button from '../../src/components/ui/Button';
import { authService } from '../../src/services/authService';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      toast.success("We've sent a reset link if that email is registered.", 'Check your email');
      setTimeout(() => router.back(), 2000);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
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
        </View>

        <View style={styles.form}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back to sign in</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a reset link.
          </Text>

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

          <Button
            label={isLoading ? 'Sending...' : 'Send Reset Link'}
            onPress={handleSubmit}
            loading={isLoading}
            fullWidth
            size="lg"
          />
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
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  backText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.greenDeep,
  },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 26,
    color: Colors.textDark,
  },
  subtitle: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
    color: Colors.textMed,
    marginTop: -Spacing.sm,
    lineHeight: 22,
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
});
