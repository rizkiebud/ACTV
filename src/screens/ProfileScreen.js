import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import {useApp} from '../context/AppContext';
import {colors, spacing, fontSizes, borderRadius} from '../theme';

// ─── Row Components ────────────────────────────────────────────────────────────
function MenuRow({icon, label, subtitle, onPress, rightEl, danger = false}) {
  return (
    <TouchableOpacity
      style={styles.menuRow}
      onPress={onPress}
      activeOpacity={0.75}>
      <View style={[styles.menuIconWrap, danger && styles.menuIconWrapDanger]}>
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>
      <View style={styles.menuBody}>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
        {subtitle && <Text style={styles.menuSub}>{subtitle}</Text>}
      </View>
      {rightEl || <Text style={styles.menuArrow}>›</Text>}
    </TouchableOpacity>
  );
}

function SectionTitle({title}) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProfileScreen({navigation}) {
  const {currentUser, logout, updateUserNotifications, updateUser} = useApp();
  const user = currentUser;

  const [show2FAInfo, setShow2FAInfo] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Keluar',
      'Yakin ingin keluar dari akun ini?',
      [
        {text: 'Batal', style: 'cancel'},
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: logout,
        },
      ],
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Ganti Password',
      'Fitur ini akan segera tersedia.',
      [{text: 'OK'}],
    );
  };

  const handleToggle2FA = () => {
    const next = !user.twoFA;
    updateUser({twoFA: next});
    setShow2FAInfo(next);
  };

  const handleToggleBiometric = () => {
    updateUser({biometric: !user.biometric});
  };

  const toggleNotif = key => {
    updateUserNotifications({[key]: !user.notifications[key]});
  };

  const storagePercent = Math.round((user.storageUsed / user.storageTotal) * 100);
  const storageColor =
    storagePercent > 80 ? colors.danger :
    storagePercent > 60 ? colors.warning : colors.success;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* ── Profile Header ── */}
      <View style={styles.profileHeader}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.avatar || 'U'}</Text>
          </View>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{user?.plan}</Text>
          </View>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.userPhone}>{user?.phone}</Text>
        <Text style={styles.memberSince}>Bergabung sejak {user?.joinDate}</Text>
      </View>

      {/* ── Usage Stats ── */}
      <View style={styles.statsGrid}>
        {[
          {value: user?.totalCameras, label: 'Kamera', icon: '📷'},
          {value: user?.totalRecordings, label: 'Rekaman', icon: '🎬'},
          {value: user?.activeDays, label: 'Hari Aktif', icon: '📅'},
        ].map(item => (
          <View key={item.label} style={styles.statsItem}>
            <Text style={styles.statsIcon}>{item.icon}</Text>
            <Text style={styles.statsValue}>{item.value}</Text>
            <Text style={styles.statsLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Cloud Storage ── */}
      <View style={styles.storageCard}>
        <View style={styles.storageHeader}>
          <View style={styles.storageLeft}>
            <Text style={styles.storageIcon}>☁️</Text>
            <View>
              <Text style={styles.storageTitle}>Penyimpanan Cloud</Text>
              <Text style={styles.storageDetail}>
                {user?.storageUsed} GB / {user?.storageTotal} GB
              </Text>
            </View>
          </View>
          <Text style={[styles.storagePct, {color: storageColor}]}>
            {storagePercent}%
          </Text>
        </View>
        <View style={styles.storageBar}>
          <View
            style={[
              styles.storageBarFill,
              {width: `${storagePercent}%`, backgroundColor: storageColor},
            ]}
          />
        </View>
        {storagePercent > 80 && (
          <View style={styles.storageWarning}>
            <Text style={styles.storageWarningText}>
              ⚠️ Penyimpanan hampir penuh. Upgrade plan Anda.
            </Text>
            <TouchableOpacity>
              <Text style={styles.upgradeLink}>Upgrade →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Keamanan Akun ── */}
      <SectionTitle title="🔐 Keamanan Akun" />
      <View style={styles.menuCard}>
        <MenuRow
          icon="🔑"
          label="Ganti Password"
          subtitle="Terakhir diubah 30 hari lalu"
          onPress={handleChangePassword}
        />
        <View style={styles.menuDivider} />
        <MenuRow
          icon="🛡️"
          label="Verifikasi 2 Langkah"
          subtitle={user?.twoFA ? 'Aktif — Email & SMS' : 'Tidak aktif'}
          rightEl={
            <Switch
              value={user?.twoFA}
              onValueChange={handleToggle2FA}
              trackColor={{false: colors.cardBorder, true: colors.accent + '60'}}
              thumbColor={user?.twoFA ? colors.accent : colors.textSecondary}
            />
          }
        />
        {show2FAInfo && (
          <View style={styles.twoFAInfo}>
            <Text style={styles.twoFAInfoText}>
              ✅ 2FA diaktifkan. Kode verifikasi akan dikirim ke {user?.email}
            </Text>
          </View>
        )}
        <View style={styles.menuDivider} />
        <MenuRow
          icon="👆"
          label="Login Biometrik"
          subtitle={user?.biometric ? 'Aktif — Sidik jari / Wajah' : 'Tidak aktif'}
          rightEl={
            <Switch
              value={user?.biometric}
              onValueChange={handleToggleBiometric}
              trackColor={{false: colors.cardBorder, true: colors.accent + '60'}}
              thumbColor={user?.biometric ? colors.accent : colors.textSecondary}
            />
          }
        />
      </View>

      {/* ── Notifikasi ── */}
      <SectionTitle title="🔔 Pengaturan Notifikasi" />
      <View style={styles.menuCard}>
        {[
          {key: 'motion', icon: '〰️', label: 'Deteksi Gerakan', sub: 'Notifikasi saat ada gerakan'},
          {key: 'offline', icon: '📵', label: 'Kamera Offline', sub: 'Kamera terputus dari jaringan'},
          {key: 'battery', icon: '🔋', label: 'Baterai Kritis', sub: 'Baterai kamera < 20%'},
          {key: 'system', icon: '⚙️', label: 'Pembaruan Sistem', sub: 'Firmware & update aplikasi'},
        ].map((item, idx, arr) => (
          <React.Fragment key={item.key}>
            <MenuRow
              icon={item.icon}
              label={item.label}
              subtitle={item.sub}
              rightEl={
                <Switch
                  value={user?.notifications?.[item.key]}
                  onValueChange={() => toggleNotif(item.key)}
                  trackColor={{false: colors.cardBorder, true: colors.accent + '60'}}
                  thumbColor={user?.notifications?.[item.key] ? colors.accent : colors.textSecondary}
                />
              }
            />
            {idx < arr.length - 1 && <View style={styles.menuDivider} />}
          </React.Fragment>
        ))}
      </View>

      {/* Delivery Channel */}
      <View style={styles.menuCard}>
        <Text style={styles.notifChannelHeader}>Kanal Pengiriman</Text>
        {[
          {key: 'push', icon: '📲', label: 'Push Notification'},
          {key: 'email', icon: '✉️', label: 'Email'},
          {key: 'sms', icon: '💬', label: 'SMS'},
        ].map((item, idx, arr) => (
          <React.Fragment key={item.key}>
            <MenuRow
              icon={item.icon}
              label={item.label}
              rightEl={
                <Switch
                  value={user?.notifications?.[item.key]}
                  onValueChange={() => toggleNotif(item.key)}
                  trackColor={{false: colors.cardBorder, true: colors.accent + '60'}}
                  thumbColor={user?.notifications?.[item.key] ? colors.accent : colors.textSecondary}
                />
              }
            />
            {idx < arr.length - 1 && <View style={styles.menuDivider} />}
          </React.Fragment>
        ))}
      </View>

      {/* ── Akun ── */}
      <SectionTitle title="👤 Akun" />
      <View style={styles.menuCard}>
        <MenuRow
          icon="✏️"
          label="Edit Profil"
          subtitle="Nama, email, nomor telepon"
          onPress={() => Alert.alert('Edit Profil', 'Fitur segera tersedia.')}
        />
        <View style={styles.menuDivider} />
        <MenuRow
          icon="💳"
          label="Langganan & Plan"
          subtitle={`${user?.plan} — Berakhir ${user?.planExpiry}`}
          onPress={() => Alert.alert('Langganan', 'Kelola plan Anda.')}
        />
        <View style={styles.menuDivider} />
        <MenuRow
          icon="💾"
          label="Manajemen Penyimpanan"
          subtitle={`${user?.storageUsed} GB digunakan dari ${user?.storageTotal} GB`}
          onPress={() => Alert.alert('Penyimpanan', 'Kelola penyimpanan cloud.')}
        />
      </View>

      {/* ── Aplikasi ── */}
      <SectionTitle title="📱 Aplikasi" />
      <View style={styles.menuCard}>
        <MenuRow
          icon="🌙"
          label="Tema Aplikasi"
          subtitle="Dark Mode (aktif)"
          onPress={() => Alert.alert('Tema', 'Hanya tersedia mode gelap.')}
        />
        <View style={styles.menuDivider} />
        <MenuRow
          icon="🌐"
          label="Bahasa"
          subtitle="Bahasa Indonesia"
          onPress={() => Alert.alert('Bahasa', 'Pilih bahasa antarmuka.')}
        />
        <View style={styles.menuDivider} />
        <MenuRow
          icon="🔄"
          label="Interval Refresh"
          subtitle="Real-time (5 detik)"
          onPress={() => Alert.alert('Refresh', 'Atur interval pembaruan data.')}
        />
      </View>

      {/* ── Bantuan ── */}
      <SectionTitle title="💬 Bantuan & Info" />
      <View style={styles.menuCard}>
        <MenuRow
          icon="❓"
          label="Pusat Bantuan"
          subtitle="FAQ dan panduan penggunaan"
          onPress={() => Alert.alert('Bantuan', 'Buka pusat bantuan MobileJaga.')}
        />
        <View style={styles.menuDivider} />
        <MenuRow
          icon="💌"
          label="Hubungi Kami"
          subtitle="support@mobilejaga.id"
          onPress={() => Alert.alert('Kontak', 'Kirim email ke support@mobilejaga.id')}
        />
        <View style={styles.menuDivider} />
        <MenuRow
          icon="⭐"
          label="Beri Rating"
          subtitle="Nilai aplikasi di App Store"
          onPress={() => Alert.alert('Rating', 'Terima kasih telah menggunakan MobileJaga!')}
        />
        <View style={styles.menuDivider} />
        <MenuRow
          icon="📋"
          label="Versi Aplikasi"
          subtitle="MobileJaga v1.0.0 (Build 100)"
          onPress={() => {}}
          rightEl={<Text style={styles.versionBadge}>v1.0.0</Text>}
        />
      </View>

      {/* ── Logout ── */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Keluar dari Akun</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          MobileJaga © 2025 · v1.0.0
        </Text>
        <Text style={styles.footerSub}>
          Dibuat dengan ❤️ untuk keamanan Anda
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.primary},
  content: {paddingBottom: spacing.xxxl},
  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.accentDark,
  },
  avatarText: {
    fontSize: fontSizes.xxxl,
    fontWeight: '800',
    color: colors.textInverse,
  },
  planBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: colors.warning,
    borderRadius: borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: colors.card,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textInverse,
  },
  userName: {
    fontSize: fontSizes.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  memberSince: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  // Stats
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  statsItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.cardBorder,
  },
  statsIcon: {fontSize: 22, marginBottom: 4},
  statsValue: {
    fontSize: fontSizes.xxl,
    fontWeight: '800',
    color: colors.accent,
  },
  statsLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Storage
  storageCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  storageLeft: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  storageIcon: {fontSize: 22},
  storageTitle: {fontSize: fontSizes.md, fontWeight: '600', color: colors.text},
  storageDetail: {fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2},
  storagePct: {fontSize: fontSizes.xl, fontWeight: '800'},
  storageBar: {
    height: 8,
    backgroundColor: colors.cardBorder,
    borderRadius: 4,
    overflow: 'hidden',
  },
  storageBarFill: {height: '100%', borderRadius: 4},
  storageWarning: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  storageWarningText: {
    fontSize: fontSizes.xs,
    color: colors.danger,
    flex: 1,
  },
  upgradeLink: {
    fontSize: fontSizes.xs,
    color: colors.accent,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  // Section
  sectionTitle: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  // Menu card
  menuCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconWrapDanger: {
    backgroundColor: colors.dangerLight,
  },
  menuIcon: {fontSize: 18},
  menuBody: {flex: 1},
  menuLabel: {fontSize: fontSizes.md, color: colors.text, fontWeight: '500'},
  menuLabelDanger: {color: colors.danger},
  menuSub: {fontSize: fontSizes.xs, color: colors.textMuted, marginTop: 2},
  menuArrow: {fontSize: 22, color: colors.textMuted},
  menuDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginLeft: spacing.lg + 36 + spacing.md,
  },
  // 2FA Info
  twoFAInfo: {
    backgroundColor: colors.successLight,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  twoFAInfoText: {
    fontSize: fontSizes.xs,
    color: colors.success,
  },
  // Notif channel header
  notifChannelHeader: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  // Version badge
  versionBadge: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    backgroundColor: colors.cardBorder,
    borderRadius: borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger + '40',
  },
  logoutIcon: {fontSize: 22},
  logoutText: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.danger,
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  footerText: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  footerSub: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
});
