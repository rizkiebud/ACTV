import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Switch,
} from 'react-native';
import {BarChart} from 'react-native-chart-kit';
import {useApp} from '../context/AppContext';
import Badge from '../components/common/Badge';
import {colors, spacing, fontSizes, borderRadius, shadows} from '../theme';
import {ACTIVITY_DATA} from '../data/mockData';

const {width} = Dimensions.get('window');
const CHART_WIDTH = width - spacing.lg * 2 - spacing.xl * 2;

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({label, value, icon, color}) {
  return (
    <View style={[styles.statCard, {borderTopColor: color, borderTopWidth: 3}]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, {color}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Camera Preview Tile ──────────────────────────────────────────────────────
function CameraPreviewTile({camera, onPress}) {
  if (!camera) {
    return (
      <View style={[styles.previewTile, styles.previewTileEmpty]}>
        <Text style={styles.emptyPreviewIcon}>📷</Text>
        <Text style={styles.emptyPreviewText}>Kamera kosong</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.previewTile} onPress={onPress} activeOpacity={0.85}>
      {/* Simulated camera feed */}
      <View style={styles.previewFeed}>
        <View style={styles.previewScanline} />
        <Text style={styles.previewCameraIcon}>📹</Text>
        <View style={styles.previewHUD}>
          <Text style={styles.previewTimestamp}>
            {new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}
          </Text>
        </View>
      </View>

      {/* Status badges */}
      <View style={styles.previewBadges}>
        {camera.isLive && camera.status === 'online' && (
          <View style={styles.liveDot}>
            <View style={styles.liveDotInner} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        {camera.isRecording && (
          <View style={styles.recDot}>
            <Text style={styles.recText}>⏺ REC</Text>
          </View>
        )}
      </View>

      {/* Camera name */}
      <View style={styles.previewNameBar}>
        <Text style={styles.previewName} numberOfLines={1}>{camera.name}</Text>
        <View style={[styles.statusDot, {backgroundColor: camera.status === 'online' ? colors.success : colors.offline}]} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Alert Row ────────────────────────────────────────────────────────────────
function AlertRow({alert, onPress}) {
  const severityColor =
    alert.severity === 'high' ? colors.danger :
    alert.severity === 'medium' ? colors.warning : colors.info;

  return (
    <TouchableOpacity style={styles.alertRow} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.alertIconWrap, {backgroundColor: severityColor + '20'}]}>
        <Text style={styles.alertIcon}>{alert.icon}</Text>
      </View>
      <View style={styles.alertBody}>
        <Text style={styles.alertTitle} numberOfLines={1}>{alert.title}</Text>
        <Text style={styles.alertCamera} numberOfLines={1}>{alert.cameraName} · {alert.time}</Text>
      </View>
      {!alert.isRead && <View style={styles.unreadDot} />}
      {alert.severity === 'high' && <Text style={styles.alertSeverityBadge}>!</Text>}
    </TouchableOpacity>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardScreen({navigation}) {
  const {
    currentUser, isArmed, toggleArmed,
    motionDetection, toggleMotionDetection,
    cameras, stats, alerts, unreadCount,
  } = useApp();

  const [armAnim] = useState(new Animated.Value(isArmed ? 1 : 0));
  const armedBg = armAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.cardLight, colors.dangerLight],
  });

  const handleToggleArmed = () => {
    Animated.timing(armAnim, {
      toValue: isArmed ? 0 : 1,
      duration: 400,
      useNativeDriver: false,
    }).start();
    toggleArmed();
  };

  const previewCameras = cameras.filter(c => c.status === 'online').slice(0, 4);
  const recentAlerts = alerts.slice(0, 4);
  const initials = currentUser?.avatar || 'U';

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0,212,255,${opacity})`,
    labelColor: () => colors.textSecondary,
    style: {borderRadius: borderRadius.md},
    barPercentage: 0.55,
    propsForBackgroundLines: {stroke: colors.cardBorder, strokeWidth: 1},
    propsForLabels: {fontSize: 11},
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Selamat datang,</Text>
          <Text style={styles.userName}>{currentUser?.name?.split(' ')[0]} 👋</Text>
        </View>
        <View style={styles.topRight}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation.navigate('Alerts')}>
              <Text style={styles.notifIcon}>🔔</Text>
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount}</Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Security Status Card ── */}
      <Animated.View style={[styles.securityCard, {backgroundColor: armedBg}]}>
        <View style={styles.securityLeft}>
          <Text style={styles.securityIcon}>{isArmed ? '🚨' : '🛡️'}</Text>
          <View>
            <Text style={styles.securityLabel}>Status Keamanan</Text>
            <Text style={[styles.securityStatus, {color: isArmed ? colors.danger : colors.success}]}>
              {isArmed ? 'ARMED — Siap Siaga' : 'DISARMED — Normal'}
            </Text>
          </View>
        </View>
        <Switch
          value={isArmed}
          onValueChange={handleToggleArmed}
          trackColor={{false: colors.cardBorder, true: colors.danger + '80'}}
          thumbColor={isArmed ? colors.danger : colors.textSecondary}
          ios_backgroundColor={colors.cardBorder}
        />
      </Animated.View>

      {/* ── Stats Row ── */}
      <View style={styles.statsRow}>
        <StatCard label="Total" value={stats.total} icon="📷" color={colors.accent} />
        <StatCard label="Online" value={stats.online} icon="🟢" color={colors.success} />
        <StatCard label="Merekam" value={stats.recording} icon="⏺" color={colors.warning} />
        <StatCard label="Offline" value={stats.offline} icon="🔴" color={colors.danger} />
      </View>

      {/* ── Quick Actions ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Aksi Cepat</Text>
      </View>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={[
            styles.quickAction,
            isArmed && styles.quickActionActive,
          ]}
          onPress={handleToggleArmed}
          activeOpacity={0.8}>
          <Text style={styles.quickActionIcon}>🚨</Text>
          <Text style={styles.quickActionLabel}>
            {isArmed ? 'Nonaktifkan\nSiaga' : 'Mode\nSiaga'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickAction,
            motionDetection && styles.quickActionMotion,
          ]}
          onPress={toggleMotionDetection}
          activeOpacity={0.8}>
          <Text style={styles.quickActionIcon}>🎯</Text>
          <Text style={styles.quickActionLabel}>
            {motionDetection ? 'Nonaktifkan\nMotion' : 'Aktifkan\nMotion'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Monitoring')}
          activeOpacity={0.8}>
          <Text style={styles.quickActionIcon}>📹</Text>
          <Text style={styles.quickActionLabel}>{'Lihat\nKamera'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Alerts')}
          activeOpacity={0.8}>
          <Text style={styles.quickActionIcon}>🔔</Text>
          <Text style={styles.quickActionLabel}>{'Semua\nPeringatan'}</Text>
          {unreadCount > 0 && (
            <View style={styles.quickActionBadge}>
              <Text style={styles.quickActionBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Live Preview 2x2 ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Preview Kamera</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Monitoring')}>
          <Text style={styles.seeAll}>Lihat Semua →</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.previewGrid}>
        {[0, 1, 2, 3].map(idx => (
          <CameraPreviewTile
            key={idx}
            camera={previewCameras[idx]}
            onPress={() =>
              previewCameras[idx] &&
              navigation.navigate('CameraDetail', {cameraId: previewCameras[idx].id})
            }
          />
        ))}
      </View>

      {/* ── Activity Chart ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Aktivitas 7 Hari</Text>
        <Text style={styles.chartSubLabel}>Jumlah peringatan</Text>
      </View>
      <View style={styles.chartCard}>
        <BarChart
          data={ACTIVITY_DATA}
          width={CHART_WIDTH}
          height={180}
          chartConfig={chartConfig}
          style={styles.chart}
          withInnerLines
          showBarTops={false}
          fromZero
          flatColor
          withHorizontalLabels
          yAxisLabel=""
          yAxisSuffix=""
        />
      </View>

      {/* ── Recent Alerts ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Peringatan Terbaru</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
          <Text style={styles.seeAll}>Lihat Semua →</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.alertsCard}>
        {recentAlerts.length === 0 ? (
          <View style={styles.emptyAlerts}>
            <Text style={styles.emptyAlertsEmoji}>✅</Text>
            <Text style={styles.emptyAlertsText}>Tidak ada peringatan</Text>
          </View>
        ) : (
          recentAlerts.map((alert, idx) => (
            <React.Fragment key={alert.id}>
              <AlertRow
                alert={alert}
                onPress={() => navigation.navigate('Alerts')}
              />
              {idx < recentAlerts.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))
        )}
      </View>

      {/* ── Motion Detection Toggle ── */}
      <View style={styles.motionCard}>
        <View style={styles.motionLeft}>
          <Text style={styles.motionIcon}>🎯</Text>
          <View>
            <Text style={styles.motionTitle}>Deteksi Gerakan</Text>
            <Text style={styles.motionSubtitle}>
              {motionDetection ? 'Aktif pada semua kamera' : 'Tidak aktif'}
            </Text>
          </View>
        </View>
        <Switch
          value={motionDetection}
          onValueChange={toggleMotionDetection}
          trackColor={{false: colors.cardBorder, true: colors.accent + '60'}}
          thumbColor={motionDetection ? colors.accent : colors.textSecondary}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  greeting: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  notifBtn: {
    position: 'relative',
    padding: spacing.xs,
  },
  notifIcon: {fontSize: 24},
  notifBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '700',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textInverse,
  },
  // Security card
  securityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  securityIcon: {fontSize: 28},
  securityLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  securityStatus: {
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statIcon: {fontSize: 18, marginBottom: 2},
  statValue: {
    fontSize: fontSizes.xl,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: fontSizes.xxs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  seeAll: {
    fontSize: fontSizes.sm,
    color: colors.accent,
    fontWeight: '600',
  },
  chartSubLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    position: 'relative',
  },
  quickActionActive: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  quickActionMotion: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  quickActionIcon: {fontSize: 20, marginBottom: 4},
  quickActionLabel: {
    fontSize: fontSizes.xxs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  quickActionBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionBadgeText: {fontSize: 9, color: '#fff', fontWeight: '700'},
  // Preview Grid
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  previewTile: {
    width: (width - spacing.lg * 2 - spacing.sm) / 2,
    height: 130,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  previewTileEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPreviewIcon: {fontSize: 28},
  emptyPreviewText: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  previewFeed: {
    flex: 1,
    backgroundColor: '#050E1A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  previewScanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '30%',
    height: 1,
    backgroundColor: colors.accent + '20',
  },
  previewCameraIcon: {fontSize: 28, opacity: 0.3},
  previewHUD: {
    position: 'absolute',
    bottom: 4,
    left: 6,
  },
  previewTimestamp: {
    fontSize: fontSizes.xxs,
    color: colors.accent,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  previewBadges: {
    position: 'absolute',
    top: 4,
    left: 4,
    flexDirection: 'row',
    gap: 4,
  },
  liveDot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  liveDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 3,
  },
  liveText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recDot: {
    backgroundColor: colors.success + 'CC',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  recText: {fontSize: 8, color: '#fff', fontWeight: '700'},
  previewNameBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.card,
  },
  previewName: {
    fontSize: fontSizes.xs,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 4,
  },
  // Chart
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  chart: {
    marginHorizontal: -spacing.sm,
    borderRadius: borderRadius.sm,
  },
  // Alerts
  alertsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  alertIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertIcon: {fontSize: 18},
  alertBody: {flex: 1},
  alertTitle: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: '600',
  },
  alertCamera: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  alertSeverityBadge: {
    fontSize: fontSizes.xs,
    color: colors.danger,
    fontWeight: '900',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginHorizontal: spacing.md,
  },
  emptyAlerts: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyAlertsEmoji: {fontSize: 28, marginBottom: spacing.sm},
  emptyAlertsText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  // Motion card
  motionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.lg,
  },
  motionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  motionIcon: {fontSize: 24},
  motionTitle: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '600',
  },
  motionSubtitle: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
