import React, {useRef, useState} from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import {colors, fontSizes, borderRadius, spacing} from '../../theme';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  autoComplete,
  leftIcon,
  rightIcon,
  onRightIconPress,
  multiline,
  numberOfLines,
  style,
  inputStyle,
  editable = true,
}) {
  const [focused, setFocused] = useState(false);
  const [showText, setShowText] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? colors.danger : colors.inputBorder,
      error ? colors.danger : colors.accent,
    ],
  });

  const isSecure = secureTextEntry && !showText;

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View style={[styles.container, {borderColor}]}>
        {leftIcon && (
          <Text style={styles.leftIcon}>{leftIcon}</Text>
        )}
        <TextInput
          style={[
            styles.input,
            leftIcon && {paddingLeft: 0},
            multiline && {height: numberOfLines ? numberOfLines * 20 + 20 : 80, textAlignVertical: 'top'},
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={() => setShowText(prev => !prev)}>
            <Text style={styles.iconText}>{showText ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity style={styles.rightIcon} onPress={onRightIconPress}>
            <Text style={styles.iconText}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      {error ? (
        <Text style={styles.error}>⚠ {error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
  },
  leftIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: fontSizes.md,
    paddingVertical: 14,
  },
  rightIcon: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  iconText: {
    fontSize: 18,
  },
  error: {
    fontSize: fontSizes.xs,
    color: colors.danger,
    marginTop: 4,
    marginLeft: 2,
  },
});
