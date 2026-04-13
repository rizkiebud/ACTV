import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {useApp} from '../../context/AppContext';
import Input from '../../components/common/Input';
import {colors, spacing, fontSizes, borderRadius} from '../../theme';

export default function RegisterScreen({navigation}) {
  const {register} = useApp();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 700, useNativeDriver: true}),
      Animated.spring(slideAnim, {toValue: 0, tension: 80, friction: 9, useNativeDriver: true}),
    ]).start();
  }, []);

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {toValue: 12, duration: 55, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -12, duration: 55, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 8, duration: 55, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -8, duration: 55, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 0, duration: 55, useNativeDriver: true}),
    ]).start();
  };

  const setField = (key, value) => {
    setForm(prev => ({...prev, [key]: value}));
    if (errors[key]) {
      setErrors(prev => ({...prev, [key]: undefined}));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = 'Nama tidak boleh kosong';
    } else if (form.name.trim().length < 3) {
      errs.name = 'Nama minimal 3 karakter';
    }
    if (!form.email.trim()) {
      errs.email = 'Email tidak boleh kosong';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Format email tidak valid';
    }
    if (!form.phone.trim()) {
      errs.phone = 'Nomor telepon tidak boleh kosong';
    } else if (!/^[+0-9]{10,15}$/.test(form.phone.replace(/[\s-]/g, ''))) {
      errs.phone = 'Nomor telepon 10–15 digit';
    }
    if (!form.password) {
      errs.password = 'Password tidak boleh kosong';
    } else if (form.password.length < 8) {
      errs.password = 'Password minimal 8 karakter';
    } else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(form.password)) {
      errs.password = 'Harus ada huruf kapital dan angka';
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Password tidak cocok';
    }
    return errs;
  };

  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return {level: 0, label: '', color: 'transparent'};
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 2) return {level: score, label: 'Lemah', color: colors.danger};
    if (score <= 3) return {level: score, label: 'Sedang', color: colors.warning};
    return {level: score, label: 'Kuat', color: colors.success};
  };

  const handleRegister = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      triggerShake();
      return;
    }
    setIsLoading(true);
    const result = await register(form);
    setIsLoading(false);
    if (result.success) {
      setSuccess(true);
      Animated.spring(successScale, {
        toValue: 1,
        tension: 60,
        friction: 5,
        useNativeDriver: true,
      }).start();
      setTimeout(() => navigation.replace('Login'), 2000);
    }
  };

  const strength = getPasswordStrength();

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Animated.View style={[styles.successCard, {transform: [{scale: successScale}]}]}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Akun Dibuat!</Text>
          <Text style={styles.successSubtitle}>
            Selamat bergabung di MobileJaga. Mengalihkan ke halaman login...
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <Animated.View style={[styles.header, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backBtnText}>← Kembali</Text>
            </TouchableOpacity>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🛡️</Text>
            </View>
            <Text style={styles.title}>Buat Akun</Text>
            <Text style={styles.subtitle}>Daftar sekarang, gratis!</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [
                  {translateY: slideAnim},
                  {translateX: shakeAnim},
                ],
              },
            ]}>

            {/* Name */}
            <Input
              label="Nama Lengkap"
              value={form.name}
              onChangeText={v => setField('name', v)}
              placeholder="Rizki Budiman"
              leftIcon="👤"
              autoCapitalize="words"
              error={errors.name}
            />

            {/* Email */}
            <Input
              label="Email"
              value={form.email}
              onChangeText={v => setField('email', v)}
              placeholder="nama@email.com"
              leftIcon="✉️"
              keyboardType="email-address"
              error={errors.email}
            />

            {/* Phone */}
            <Input
              label="Nomor Telepon"
              value={form.phone}
              onChangeText={v => setField('phone', v)}
              placeholder="+62 812 3456 7890"
              leftIcon="📞"
              keyboardType="phone-pad"
              error={errors.phone}
            />

            {/* Password */}
            <Input
              label="Password"
              value={form.password}
              onChangeText={v => setField('password', v)}
              placeholder="Minimal 8 karakter"
              leftIcon="🔒"
              secureTextEntry
              error={errors.password}
            />

            {/* Password Strength */}
            {form.password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            i <= strength.level ? strength.color : colors.cardBorder,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, {color: strength.color}]}>
                  {strength.label}
                </Text>
              </View>
            )}

            {/* Confirm Password */}
            <Input
              label="Konfirmasi Password"
              value={form.confirmPassword}
              onChangeText={v => setField('confirmPassword', v)}
              placeholder="Ulangi password"
              leftIcon="🔐"
              secureTextEntry
              error={errors.confirmPassword}
            />

            {/* Terms */}
            <View style={styles.termsRow}>
              <Text style={styles.termsText}>
                Dengan mendaftar, Anda menyetujui{' '}
                <Text style={styles.termsLink}>Syarat & Ketentuan</Text>
                {' '}dan{' '}
                <Text style={styles.termsLink}>Kebijakan Privasi</Text>
                {' '}kami.
              </Text>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerBtn, isLoading && styles.registerBtnLoading]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}>
              {isLoading ? (
                <View style={styles.loadRow}>
                  <ActivityIndicator color={colors.textInverse} size="small" />
                  <Text style={[styles.registerBtnText, {marginLeft: spacing.sm}]}>
                    Mendaftar...
                  </Text>
                </View>
              ) : (
                <Text style={styles.registerBtnText}>Daftar Sekarang 🚀</Text>
              )}
            </TouchableOpacity>

            {/* Login link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Masuk</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  // Success
  successContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  successCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.success,
  },
  successEmoji: {fontSize: 56, marginBottom: spacing.md},
  successTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Header
  header: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: spacing.xl,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  backBtnText: {
    fontSize: fontSizes.md,
    color: colors.accent,
    fontWeight: '600',
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.accentLight,
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoEmoji: {fontSize: 32},
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginTop: 4,
  },
  // Card
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  // Password Strength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  strengthBars: {
    flexDirection: 'row',
    flex: 1,
    gap: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    marginLeft: spacing.sm,
    width: 46,
    textAlign: 'right',
  },
  // Terms
  termsRow: {
    marginBottom: spacing.lg,
  },
  termsText: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.accent,
    fontWeight: '600',
  },
  // Button
  registerBtn: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  registerBtnLoading: {opacity: 0.7},
  registerBtnText: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.textInverse,
  },
  loadRow: {flexDirection: 'row', alignItems: 'center'},
  // Login link
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginPrompt: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: fontSizes.md,
    color: colors.accent,
    fontWeight: '700',
  },
});
