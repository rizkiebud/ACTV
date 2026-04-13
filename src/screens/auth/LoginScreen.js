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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {useApp} from '../../context/AppContext';
import Input from '../../components/common/Input';
import {colors, spacing, fontSizes, borderRadius} from '../../theme';

const {width} = Dimensions.get('window');

const TAB_TYPES = [
  {key: 'email', label: 'Email', placeholder: 'rizki@mobilejaga.id', icon: '✉️', keyboard: 'email-address'},
  {key: 'whatsapp', label: 'WhatsApp', placeholder: '+62 812 3456 7890', icon: '💬', keyboard: 'phone-pad'},
  {key: 'phone', label: 'Telepon', placeholder: '+62 812 3456 7890', icon: '📞', keyboard: 'phone-pad'},
];

export default function LoginScreen({navigation}) {
  const {login} = useApp();
  const [loginType, setLoginType] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Animations
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {toValue: 1, tension: 60, friction: 6, useNativeDriver: true}),
      Animated.timing(fadeAnim, {toValue: 1, duration: 700, useNativeDriver: true}),
      Animated.spring(slideAnim, {toValue: 0, tension: 80, friction: 9, useNativeDriver: true}),
    ]).start();
  }, []);

  const handleTabChange = tabKey => {
    const index = TAB_TYPES.findIndex(t => t.key === tabKey);
    const tabWidth = (width - spacing.lg * 2 - spacing.xl * 2 - 8) / 3;
    Animated.spring(tabIndicatorAnim, {
      toValue: index * tabWidth,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
    setLoginType(tabKey);
    setIdentifier('');
    setErrors({});
  };

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {toValue: 14, duration: 55, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -14, duration: 55, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 10, duration: 55, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -10, duration: 55, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 5, duration: 55, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 0, duration: 55, useNativeDriver: true}),
    ]).start();
  };

  const validate = () => {
    const newErrors = {};
    const tab = TAB_TYPES.find(t => t.key === loginType);
    if (!identifier.trim()) {
      newErrors.identifier = `${tab.label} tidak boleh kosong`;
    } else if (
      loginType === 'email' &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
    ) {
      newErrors.identifier = 'Format email tidak valid';
    } else if (
      (loginType === 'whatsapp' || loginType === 'phone') &&
      !/^[+0-9]{10,15}$/.test(identifier.replace(/[\s-]/g, ''))
    ) {
      newErrors.identifier = 'Nomor harus 10–15 digit';
    }
    if (!password) {
      newErrors.password = 'Password tidak boleh kosong';
    } else if (password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    return newErrors;
  };

  const handleLogin = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      triggerShake();
      return;
    }
    setIsLoading(true);
    setErrors({});
    Animated.sequence([
      Animated.timing(buttonScale, {toValue: 0.94, duration: 90, useNativeDriver: true}),
      Animated.timing(buttonScale, {toValue: 1, duration: 90, useNativeDriver: true}),
    ]).start();
    const result = await login(identifier, password);
    if (!result.success) {
      setErrors({general: result.message});
      triggerShake();
    }
    setIsLoading(false);
  };

  const fillDemo = () => {
    setLoginType('email');
    setIdentifier('rizki@mobilejaga.id');
    setPassword('password123');
    setErrors({});
    const tabWidth = (width - spacing.lg * 2 - spacing.xl * 2 - 8) / 3;
    Animated.spring(tabIndicatorAnim, {
      toValue: 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const currentTab = TAB_TYPES.find(t => t.key === loginType);
  const tabWidth = (width - spacing.lg * 2 - spacing.xl * 2 - 8) / 3;

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

          {/* Header / Logo */}
          <Animated.View style={[styles.header, {opacity: fadeAnim}]}>
            <Animated.View style={[styles.logoCircle, {transform: [{scale: logoScale}]}]}>
              <Text style={styles.logoEmoji}>🛡️</Text>
            </Animated.View>
            <Text style={styles.appName}>MobileJaga</Text>
            <Text style={styles.appTagline}>Sistem CCTV Cerdas</Text>
          </Animated.View>

          {/* Form Card */}
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
            <Text style={styles.cardTitle}>Masuk</Text>
            <Text style={styles.cardSubtitle}>Selamat datang kembali 👋</Text>

            {/* General Error */}
            {errors.general ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️  {errors.general}</Text>
              </View>
            ) : null}

            {/* Login Type Tabs */}
            <View style={styles.tabOuter}>
              <Animated.View
                style={[
                  styles.tabIndicator,
                  {width: tabWidth, transform: [{translateX: tabIndicatorAnim}]},
                ]}
              />
              {TAB_TYPES.map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, {width: tabWidth}]}
                  onPress={() => handleTabChange(tab.key)}
                  activeOpacity={0.75}>
                  <Text
                    style={[
                      styles.tabText,
                      loginType === tab.key && styles.tabTextActive,
                    ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Identifier Input */}
            <Input
              label={currentTab.label}
              value={identifier}
              onChangeText={v => {
                setIdentifier(v);
                if (errors.identifier) {
                  setErrors(p => ({...p, identifier: undefined}));
                }
              }}
              placeholder={currentTab.placeholder}
              keyboardType={currentTab.keyboard}
              leftIcon={currentTab.icon}
              error={errors.identifier}
              style={{marginBottom: spacing.xs}}
            />

            {/* Password Input */}
            <Input
              label="Password"
              value={password}
              onChangeText={v => {
                setPassword(v);
                if (errors.password) {
                  setErrors(p => ({...p, password: undefined}));
                }
              }}
              placeholder="Masukkan password"
              secureTextEntry
              leftIcon="🔒"
              error={errors.password}
              style={{marginBottom: spacing.xs}}
            />

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Lupa Password?</Text>
            </TouchableOpacity>

            {/* Demo hint */}
            <TouchableOpacity style={styles.demoBadge} onPress={fillDemo}>
              <Text style={styles.demoTextLabel}>Demo: </Text>
              <Text style={styles.demoTextValue}>
                rizki@mobilejaga.id / password123
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Animated.View style={{transform: [{scale: buttonScale}]}}>
              <TouchableOpacity
                style={[styles.loginBtn, isLoading && styles.loginBtnLoading]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}>
                {isLoading ? (
                  <View style={styles.loadRow}>
                    <ActivityIndicator color={colors.textInverse} size="small" />
                    <Text style={[styles.loginBtnText, {marginLeft: spacing.sm}]}>
                      Memverifikasi...
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.loginBtnText}>Masuk →</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Register */}
            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>Belum punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Daftar Sekarang</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.footer, {opacity: fadeAnim}]}>
            <Text style={styles.footerText}>
              🔒 Terenkripsi dengan TLS 256-bit
            </Text>
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
  // Header
  header: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: spacing.xl,
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.accentLight,
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoEmoji: {fontSize: 38},
  appName: {
    fontSize: fontSizes.xxxl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1,
  },
  appTagline: {
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
  cardTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  // Error
  errorBanner: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    color: colors.danger,
    fontSize: fontSizes.sm,
  },
  // Tabs
  tabOuter: {
    flexDirection: 'row',
    backgroundColor: colors.input,
    borderRadius: borderRadius.sm,
    padding: 4,
    marginBottom: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    backgroundColor: colors.accent,
    borderRadius: 6,
  },
  tab: {
    paddingVertical: 9,
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.textInverse,
  },
  // Forgot
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
    marginTop: -spacing.xs,
  },
  forgotText: {
    fontSize: fontSizes.sm,
    color: colors.accent,
    fontWeight: '600',
  },
  // Demo
  demoBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent + '40',
  },
  demoTextLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  demoTextValue: {
    fontSize: fontSizes.xs,
    color: colors.accent,
    fontWeight: '700',
  },
  // Button
  loginBtn: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  loginBtnLoading: {
    opacity: 0.7,
  },
  loginBtnText: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.textInverse,
    letterSpacing: 0.3,
  },
  loadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Register
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerPrompt: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: fontSizes.md,
    color: colors.accent,
    fontWeight: '700',
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  footerText: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
});
