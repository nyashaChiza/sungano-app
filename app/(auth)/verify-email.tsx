import React, { useState, useRef, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Fonts, Spacing, Radius } from '../../src/constants/theme';
import SunganoMark from '../../src/components/brand/SunganoMark';
import Button from '../../src/components/ui/Button';
import { useAuth } from '../../src/hooks/useAuth';
import { toast } from '../../src/utils/toast';

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { verifyEmail } = useAuth();

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please enter the 6-digit code.');
      return;
    }
    setIsSubmitting(true);
    try {
      await verifyEmail(code);
      toast.success('Email verified successfully!');
      router.replace('/');
    } catch {
      toast.error('Invalid or expired code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    toast.info('A new code has been sent to your email.');
  };

  const maskedEmail = email
    ? email.replace(/(.{2}).+(@.+)/, '$1***$2')
    : 'your email';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <SunganoMark size={56} color={Colors.white} strokeWidth={3} />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{' '}
            <Text style={styles.email}>{maskedEmail}</Text>
          </Text>

          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={r => { inputRefs.current[i] = r; }}
                value={digit}
                onChangeText={v => handleChange(v, i)}
                onKeyPress={e => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                selectionColor={Colors.greenDeep}
              />
            ))}
          </View>

          <Button
            label={isSubmitting ? 'Verifying...' : 'Verify Email'}
            onPress={handleVerify}
            loading={isSubmitting}
            fullWidth
            size="lg"
            style={styles.btn}
          />

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't get the email? </Text>
            <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
              <Text style={[styles.resendLink, resendTimer > 0 && styles.resendDisabled]}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenDeep },
  scroll: { flexGrow: 1 },
  hero: {
    alignItems: 'center',
    paddingTop: 72,
    paddingBottom: 32,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.xxxl,
    paddingTop: 40,
    gap: Spacing.xl,
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
    lineHeight: 22,
    marginTop: -Spacing.md,
  },
  email: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.textDark,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: Fonts.mono,
    color: Colors.textDark,
  },
  otpBoxFilled: {
    borderColor: Colors.greenDeep,
    backgroundColor: Colors.greenPale,
  },
  btn: { marginTop: Spacing.sm },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    color: Colors.textMed,
  },
  resendLink: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.greenDeep,
  },
  resendDisabled: { color: Colors.textLight },
  backBtn: { alignSelf: 'center', paddingVertical: Spacing.sm },
  backText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textMed,
  },
});
