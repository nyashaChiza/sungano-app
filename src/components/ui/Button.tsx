import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: Colors.greenDeep, text: Colors.white },
  secondary: { bg: Colors.greenPale, text: Colors.greenDeep },
  outline: { bg: 'transparent', text: Colors.greenDeep, border: Colors.greenDeep },
  ghost: { bg: 'transparent', text: Colors.greenDeep },
  danger: { bg: Colors.red, text: Colors.white },
};

const SIZE_STYLES: Record<ButtonSize, { py: number; px: number; fontSize: number; radius: number }> = {
  sm: { py: 8, px: 16, fontSize: 13, radius: Radius.md },
  md: { py: 13, px: 20, fontSize: 15, radius: Radius.lg },
  lg: { py: 16, px: 24, fontSize: 17, radius: Radius.xl },
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: variantStyle.bg,
          paddingVertical: sizeStyle.py,
          paddingHorizontal: sizeStyle.px,
          borderRadius: sizeStyle.radius,
          borderWidth: variantStyle.border ? 1.5 : 0,
          borderColor: variantStyle.border,
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text} size="small" />
      ) : (
        <Text
          style={[
            styles.label,
            {
              color: variantStyle.text,
              fontSize: sizeStyle.fontSize,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    letterSpacing: 0.2,
  },
});
