import React, {useRef} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  View,
} from 'react-native';
import {colors, fontSizes, borderRadius, spacing} from '../../theme';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  style,
  textStyle,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
    }).start();
  };

  const buttonStyles = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    (disabled || loading) && styles.disabled,
    style,
  ];

  const labelStyles = [
    styles.label,
    styles[`label_${variant}`],
    styles[`labelSize_${size}`],
    textStyle,
  ];

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        style={buttonStyles}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator
              color={
                variant === 'primary' || variant === 'danger'
                  ? colors.textInverse
                  : colors.accent
              }
              size="small"
            />
            <Text style={[labelStyles, {marginLeft: spacing.sm}]}>
              Memuat...
            </Text>
          </View>
        ) : (
          <View style={styles.contentRow}>
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text style={labelStyles}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.xs,
    fontSize: fontSizes.lg,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Variants
  variant_primary: {
    backgroundColor: colors.accent,
  },
  variant_secondary: {
    backgroundColor: colors.cardLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  variant_danger: {
    backgroundColor: colors.danger,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_success: {
    backgroundColor: colors.success,
  },

  // Label colors
  label_primary: {color: colors.textInverse},
  label_secondary: {color: colors.text},
  label_danger: {color: '#FFFFFF'},
  label_outline: {color: colors.accent},
  label_ghost: {color: colors.accent},
  label_success: {color: '#FFFFFF'},

  // Sizes
  size_sm: {paddingVertical: 8, paddingHorizontal: spacing.md},
  size_md: {paddingVertical: 14, paddingHorizontal: spacing.xl},
  size_lg: {paddingVertical: 18, paddingHorizontal: spacing.xl},

  labelSize_sm: {fontSize: fontSizes.sm},
  labelSize_md: {fontSize: fontSizes.lg},
  labelSize_lg: {fontSize: fontSizes.xl},

  // Disabled
  disabled: {opacity: 0.5},
});
