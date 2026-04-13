import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Switch,
  Dimensions,
  FlatList,
} from 'react-native';
import {useApp} from '../../context/AppContext';
import {colors, spacing, fontSizes, borderRadius} from '../../theme';
import {RECORDINGS} from '../../data/mockData';

const {width} = Dimensions.get('window');

const TABS = ['Live', 'Rekaman', 'Pengaturan', 'Info'];

// ─── Tab: Live ─────────────────────────────────────────────────────────────────
function LiveTab({camera, onUpdateCamera}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(camera.isRecording);
  const [zoom, setZoom] = useState(1.0);
  const [ptzActive, setPtzActive] = useState(null);
  const scanAnim = useRef(new Animated.Value(0)).current;
  const signalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {toValue: 1, duration: 2500, useNativeDriver: true}),
        Animated.timing(scanAnim, {toValue: 0, duration: 0, useNativeDriver: true}),
      ]),
    );
    const signal = Animated.loop(
      Animated.sequence([
        Animated.timing(signalAnim, {toValue: 1, duration: 800, useNativeDriver: true}),
        Animated.timing(signalAnim, {toValue: 0.3, duration: 800, useNativeDriver: true}),
      ]),
    );
    scan.start();
    signal.start();
    return () => {scan.stop(); signal.stop();};
  }, []);

  const scanY = scanAnim.interpolate({inputRange: [0, 1], outputRange: [0, 220]});

  const PTZButton = ({dir, icon, active}) => (
    <TouchableOpacity
      style={[styles.ptzBtn, active && styles.ptzBtnActive]}
      onPressIn={() => setPtzActive(dir)}
      onPressOut={() => setPtzActive(null)}
      activeOpacity={0.7}>
      <Text style={styles.ptzIcon}>{icon}</Text>
    </TouchableOpacity>
  );

  const isOnline = camera.status === 'online';

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {/* Player */}
      <View style={styles.player}>
        <View style={styles.playerFeed}>
          {isOnline ? (
            <>
              {/* Simulated feed */}
              <View style={styles.playerBg}>
                <Text style={styles.playerCamIcon}>📹</Text>
              </View>
              {/* Scan line */}
              <Animated.View style={[styles.scanLine, {transform: [{translateY: scanY}]}]} />
              {/* HUD Overlay */}
              <View style={styles.hudOverlay}>
                <View style={styles.hudTopLeft}>
                  <Animated.View style={{opacity: signalAnim}}>
                    <View style={styles.livePill}>
                      <View style={styles.livePillDot} />
                      <Text style={styles.livePillText}>LIVE</Text>
                    </View>
                  </Animated.View>
                </View>
                <View style={styles.hudTopRight}>
                  <Text style={styles.hudTimestamp}>
                    {new Date().toLocaleTimeString('id-ID')}
                  </Text>
                </View>
                <View style={styles.hudBottomLeft}>
                  <Text style={styles.hudCamName}>{camera.name}</Text>
                  <Text style={styles.hudLocation}>{camera.location}</Text>
                </View>
                <View style={styles.hudBottomRight}>
                  <Text style={styles.hudZoom}>🔍 {zoom.toFixed(1)}x</Text>
                  <Text style={styles.hudRes}>{camera.resolution}</Text>
                </View>
              </View>
              {/* Corner brackets */}
              {['tl','tr','bl','br'].map(c => (
                <View key={c} style={[styles.bracket, styles[`bracket_${c}`]]} />
              ))}
            </>
          ) : (
            <View style={styles.playerOffline}>
              <Text style={styles.playerOfflineIcon}>📵</Text>
              <Text style={styles.playerOfflineTitle}>Kamera Offline</Text>
              <Text style={styles.playerOfflineSub}>Terakhir aktif: {camera.lastSeen}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Zoom Slider */}
      {isOnline && (
        <View style={styles.zoomRow}>
          <Text style={styles.zoomLabel}>🔍</Text>
          <View style={styles.zoomTrack}>
            {[1.0, 1.5, 2.0, 2.5, 3.0, 4.0].map(z => (
              <TouchableOpacity
                key={z}
                style={[styles.zoomStep, zoom === z && styles.zoomStepActive]}
                onPress={() => setZoom(z)}>
                <Text style={[styles.zoomStepText, zoom === z && styles.zoomStepTextActive]}>
                  {z}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* PTZ Controls */}
      {isOnline && (
        <View style={styles.ptzSection}>
          <Text style={styles.ptzTitle}>Kontrol PTZ</Text>
          <View style={styles.ptzGrid}>
            <View style={styles.ptzRow}>
              <View style={styles.ptzEmpty} />
              <PTZButton dir="up" icon="▲" active={ptzActive === 'up'} />
              <View style={styles.ptzEmpty} />
            </View>
            <View style={styles.ptzRow}>
              <PTZButton dir="left" icon="◄" active={ptzActive === 'left'} />
              <TouchableOpacity style={styles.ptzCenter}>
                <Text style={styles.ptzCenterIcon}>⊕</Text>
              </TouchableOpacity>
              <PTZButton dir="right" icon="►" active={ptzActive === 'right'} />
            </View>
            <View style={styles.ptzRow}>
              <View style={styles.ptzEmpty} />
              <PTZButton dir="down" icon="▼" active={ptzActive === 'down'} />
              <View style={styles.ptzEmpty} />
            </View>
          </View>
        </View>
      )}

      {/* Action Toolbar */}
      <View style={styles.toolbar}>
        {[
          {icon: '📸', label: 'Snapshot', onPress: () => {}},
          {icon: isRecording ? '⏹' : '⏺', label: isRecording ? 'Stop' : 'Rekam',
            onPress: () => {setIsRecording(p => !p); onUpdateCamera({isRecording: !isRecording});},
            color: isRecording ? colors.danger : colors.recording},
          {icon: isMuted ? '🔇' : '🔊', label: isMuted ? 'Unmute' : 'Mute',
            onPress: () => setIsMuted(p => !p)},
          {icon: '📤', label: 'Bagikan', onPress: () => {}},
        ].map(item => (
          <TouchableOpacity key={item.label} style={styles.toolbarBtn} onPress={item.onPress}>
            <View style={[styles.toolbarIconWrap, item.color && {backgroundColor: item.color + '20'}]}>
              <Text style={styles.toolbarIcon}>{item.icon}</Text>
            </View>
            <Text style={[styles.toolbarLabel, item.color && {color: item.color}]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Tab: Rekaman ──────────────────────────────────────────────────────────────
function RecordingTab({cameraId}) {
  const [selectedDate, setSelectedDate] = useState('Hari ini');
  const recordings = RECORDINGS.filter(r => r.cameraId === cameraId);
  const dates = ['Hari ini', 'Kemarin', '11 Apr', '10 Apr', '9 Apr'];

  const typeIcon = type =>
    type === 'motion' ? '〰️' : '🕐';

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {/* Date filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
        {dates.map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.dateTab, selectedDate === d && styles.dateTabActive]}
            onPress={() => setSelectedDate(d)}>
            <Text style={[styles.dateTabText, selectedDate === d && styles.dateTabTextActive]}>
              {d}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {recordings.length === 0 ? (
        <View style={styles.emptyRec}>
          <Text style={styles.emptyRecEmoji}>🎬</Text>
          <Text style={styles.emptyRecTitle}>Belum ada rekaman</Text>
          <Text style={styles.emptyRecSub}>Rekaman akan muncul di sini</Text>
        </View>
      ) : (
        recordings.map(rec => (
          <View key={rec.id} style={styles.recCard}>
            {/* Thumbnail */}
            <View style={styles.recThumb}>
              <View style={styles.recThumbBg}>
                <Text style={styles.recThumbIcon}>🎬</Text>
              </View>
              <View style={styles.recTypeBadge}>
                <Text style={styles.recTypeText}>{typeIcon(rec.type)}</Text>
              </View>
            </View>

            {/* Info */}
            <View style={styles.recInfo}>
              <Text style={styles.recDate}>{rec.date}</Text>
              <Text style={styles.recTime}>{rec.time}</Text>
              <View style={styles.recMeta}>
                <Text style={styles.recDuration}>⏱ {rec.duration}</Text>
                <Text style={styles.recSize}> · 💾 {rec.size}</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.recActions}>
              <TouchableOpacity style={styles.recBtn}>
                <Text style={styles.recBtnIcon}>▶</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.recBtn}>
                <Text style={styles.recBtnIcon}>⬇</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// ─── Tab: Pengaturan ──────────────────────────────────────────────────────────
function SettingsTab({camera, onUpdateCamera}) {
  const [settings, setSettings] = useState({
    nightVision: camera.nightVision,
    audio: camera.audio,
    motionDetection: camera.motionDetection,
    autoRecord: camera.autoRecord,
  });
  const [resolution, setResolution] = useState(camera.resolution);
  const [fps, setFps] = useState(String(camera.fps));

  const toggleSetting = key => {
    const updated = {...settings, [key]: !settings[key]};
    setSettings(updated);
    onUpdateCamera({[key]: !settings[key]});
  };

  const settingItems = [
    {key: 'nightVision', label: 'Night Vision', icon: '🌙', sub: 'Aktifkan kamera inframerah'},
    {key: 'audio', label: 'Audio', icon: '🔊', sub: 'Rekam & monitor suara'},
    {key: 'motionDetection', label: 'Deteksi Gerakan', icon: '🎯', sub: 'Kirim notifikasi saat ada gerakan'},
    {key: 'autoRecord', label: 'Rekam Otomatis', icon: '⏺', sub: 'Rekam saat gerakan terdeteksi'},
  ];

  const resolutions = ['720p', '1080p', '2K', '4K'];
  const fpsList = ['10', '15', '20', '25', '30', '60'];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {/* Toggle Settings */}
      <Text style={styles.settingsSection}>Fitur Kamera</Text>
      {settingItems.map(item => (
        <View key={item.key} style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>{item.icon}</Text>
            <View>
              <Text style={styles.settingLabel}>{item.label}</Text>
              <Text style={styles.settingSub}>{item.sub}</Text>
            </View>
          </View>
          <Switch
            value={settings[item.key]}
            onValueChange={() => toggleSetting(item.key)}
            trackColor={{false: colors.cardBorder, true: colors.accent + '60'}}
            thumbColor={settings[item.key] ? colors.accent : colors.textSecondary}
          />
        </View>
      ))}

      {/* Resolution */}
      <Text style={[styles.settingsSection, {marginTop: spacing.lg}]}>Kualitas Video</Text>
      <View style={styles.settingCard}>
        <Text style={styles.settingCardLabel}>Resolusi</Text>
        <View style={styles.optionRow}>
          {resolutions.map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.optionBtn, resolution === r && styles.optionBtnActive]}
              onPress={() => setResolution(r)}>
              <Text style={[styles.optionBtnText, resolution === r && styles.optionBtnTextActive]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.settingCard}>
        <Text style={styles.settingCardLabel}>Frame Rate (FPS)</Text>
        <View style={styles.optionRow}>
          {fpsList.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.optionBtn, fps === f && styles.optionBtnActive]}
              onPress={() => setFps(f)}>
              <Text style={[styles.optionBtnText, fps === f && styles.optionBtnTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Motion Sensitivity */}
      <Text style={[styles.settingsSection, {marginTop: spacing.lg}]}>Sensitivitas Gerakan</Text>
      <View style={styles.settingCard}>
        <View style={styles.sensitivityHeader}>
          <Text style={styles.settingCardLabel}>Level Sensitivitas</Text>
          <Text style={styles.sensitivityValue}>{camera.motionSensitivity}%</Text>
        </View>
        <View style={styles.sensitivityBar}>
          <View style={[styles.sensitivityFill, {width: `${camera.motionSensitivity}%`}]} />
        </View>
        <View style={styles.sensitivityLabels}>
          <Text style={styles.sensitivityLabelText}>Rendah</Text>
          <Text style={styles.sensitivityLabelText}>Sedang</Text>
          <Text style={styles.sensitivityLabelText}>Tinggi</Text>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn}>
        <Text style={styles.saveBtnText}>💾  Simpan Pengaturan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Tab: Info ─────────────────────────────────────────────────────────────────
function InfoTab({camera}) {
  const InfoRow = ({label, value, valueColor}) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor && {color: valueColor}]}>{value}</Text>
    </View>
  );

  const batteryLevel = camera.batteryLevel;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {/* Battery (if wireless) */}
      {batteryLevel !== null && (
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>🔋 Baterai</Text>
          <View style={styles.batteryBarRow}>
            <View style={styles.batteryBarTrack}>
              <View style={[
                styles.batteryBarFill,
                {
                  width: `${batteryLevel}%`,
                  backgroundColor: batteryLevel < 20 ? colors.danger : batteryLevel < 50 ? colors.warning : colors.success,
                },
              ]} />
            </View>
            <Text style={[
              styles.batteryPct,
              {color: batteryLevel < 20 ? colors.danger : colors.text},
            ]}>
              {batteryLevel}%
            </Text>
          </View>
          {batteryLevel < 20 && (
            <Text style={styles.batteryWarning}>⚠️ Baterai kritis! Segera isi daya.</Text>
          )}
        </View>
      )}

      {/* Spesifikasi */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>📋 Spesifikasi</Text>
        <InfoRow label="Model" value={camera.model} />
        <InfoRow label="Serial" value={camera.serialNumber} />
        <InfoRow label="Firmware" value={camera.firmware} />
        <InfoRow label="Resolusi" value={camera.resolution} />
        <InfoRow label="Frame Rate" value={`${camera.fps} FPS`} />
      </View>

      {/* Jaringan */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>📡 Jaringan</Text>
        <InfoRow label="Alamat IP" value={camera.ip} />
        <InfoRow label="MAC Address" value={camera.mac} />
        <InfoRow label="Tipe Jaringan" value={camera.network} />
        <InfoRow label="Kekuatan Sinyal" value={camera.signalStrength}
          valueColor={
            camera.signalStrength === 'Kuat' || camera.signalStrength === 'Sangat Kuat'
              ? colors.success
              : camera.signalStrength === 'Sedang' ? colors.warning : colors.danger
          }
        />
      </View>

      {/* Lokasi & Operasional */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>📍 Lokasi & Operasional</Text>
        <InfoRow label="Lokasi" value={camera.location} />
        <InfoRow label="Koordinat" value={camera.coordinates} />
        <InfoRow label="Tgl. Instalasi" value={camera.installDate} />
        <InfoRow label="Pemeliharaan" value={camera.lastMaintenance} />
        <InfoRow label="Uptime" value={camera.uptime}
          valueColor={parseFloat(camera.uptime) > 95 ? colors.success : colors.warning}
        />
      </View>

      {/* Kemampuan */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>⚙️ Kemampuan</Text>
        <InfoRow label="Night Vision" value={camera.nightVision ? '✅ Aktif' : '❌ Tidak ada'} />
        <InfoRow label="Audio" value={camera.audio ? '✅ Aktif' : '❌ Tidak ada'} />
        <InfoRow label="Deteksi Gerakan" value={camera.motionDetection ? '✅ Aktif' : '❌ Nonaktif'} />
        <InfoRow label="Rekam Otomatis" value={camera.autoRecord ? '✅ Aktif' : '❌ Nonaktif'} />
      </View>

      {/* Status */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>📊 Status Saat Ini</Text>
        <InfoRow label="Koneksi" value={camera.status === 'online' ? '🟢 Online' : '🔴 Offline'}
          valueColor={camera.status === 'online' ? colors.success : colors.danger}
        />
        <InfoRow label="Streaming" value={camera.isLive && camera.status === 'online' ? '✅ Aktif' : '❌ Tidak aktif'} />
        <InfoRow label="Merekam" value={camera.isRecording ? '⏺ Ya' : '— Tidak'} />
        <InfoRow label="Terakhir Aktif" value={camera.lastSeen} />
      </View>
    </ScrollView>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function CameraDetailScreen({route, navigation}) {
  const {cameraId} = route.params;
  const {getCameraById, updateCamera} = useApp();
  const camera = getCameraById(cameraId);

  const [activeTab, setActiveTab] = useState(0);
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const tabWidth = width / TABS.length;

  if (!camera) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Kamera tidak ditemukan</Text>
      </View>
    );
  }

  const handleTabChange = idx => {
    Animated.spring(indicatorAnim, {
      toValue: idx * tabWidth,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
    setActiveTab(idx);
  };

  const handleUpdateCamera = updates => updateCamera(cameraId, updates);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: return <LiveTab camera={camera} onUpdateCamera={handleUpdateCamera} />;
      case 1: return <RecordingTab cameraId={cameraId} />;
      case 2: return <SettingsTab camera={camera} onUpdateCamera={handleUpdateCamera} />;
      case 3: return <InfoTab camera={camera} />;
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[
            styles.statusBullet,
            {backgroundColor: camera.status === 'online' ? colors.success : colors.offline},
          ]} />
          <View>
            <Text style={styles.headerTitle}>{camera.name}</Text>
            <Text style={styles.headerSub}>{camera.location}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {camera.isLive && camera.status === 'online' && (
            <View style={styles.headerLiveBadge}>
              <View style={styles.headerLiveDot} />
              <Text style={styles.headerLiveText}>LIVE</Text>
            </View>
          )}
          {camera.isRecording && (
            <View style={styles.headerRecBadge}>
              <Text style={styles.headerRecText}>⏺</Text>
            </View>
          )}
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <Animated.View
          style={[
            styles.tabBarIndicator,
            {width: tabWidth, transform: [{translateX: indicatorAnim}]},
          ]}
        />
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBarItem, {width: tabWidth}]}
            onPress={() => handleTabChange(idx)}>
            <Text style={[styles.tabBarText, activeTab === idx && styles.tabBarTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContentContainer}>
        {renderTabContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.primary},
  notFound: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  notFoundText: {color: colors.text, fontSize: fontSizes.lg},
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerLeft: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  statusBullet: {width: 10, height: 10, borderRadius: 5},
  headerTitle: {fontSize: fontSizes.lg, fontWeight: '700', color: colors.text},
  headerSub: {fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2},
  headerRight: {flexDirection: 'row', gap: spacing.xs},
  headerLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.live,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerLiveDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', marginRight: 4},
  headerLiveText: {fontSize: fontSizes.xs, color: '#fff', fontWeight: '700'},
  headerRecBadge: {
    backgroundColor: colors.recording + 'CC',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerRecText: {fontSize: fontSizes.md},
  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 2,
    borderBottomColor: colors.cardBorder,
    position: 'relative',
  },
  tabBarIndicator: {
    position: 'absolute',
    bottom: -2,
    height: 2,
    backgroundColor: colors.accent,
  },
  tabBarItem: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabBarText: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    fontWeight: '600',
  },
  tabBarTextActive: {color: colors.accent},
  tabContentContainer: {flex: 1},
  tabContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  // Live Tab
  player: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#050E1A',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  playerFeed: {flex: 1, position: 'relative'},
  playerBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050E1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerCamIcon: {fontSize: 52, opacity: 0.1},
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: colors.accent + '60',
  },
  hudOverlay: {...StyleSheet.absoluteFillObject},
  hudTopLeft: {position: 'absolute', top: 8, left: 8},
  hudTopRight: {position: 'absolute', top: 10, right: 10},
  hudBottomLeft: {position: 'absolute', bottom: 8, left: 10},
  hudBottomRight: {position: 'absolute', bottom: 8, right: 10, alignItems: 'flex-end'},
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.live,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  livePillDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', marginRight: 4},
  livePillText: {fontSize: 11, color: '#fff', fontWeight: '800', letterSpacing: 1},
  hudTimestamp: {
    fontSize: 11,
    color: colors.accent,
    fontFamily: 'monospace',
  },
  hudCamName: {fontSize: 11, color: '#fff', fontWeight: '600'},
  hudLocation: {fontSize: 9, color: colors.textSecondary},
  hudZoom: {fontSize: 10, color: colors.accent},
  hudRes: {fontSize: 9, color: colors.textSecondary},
  bracket: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: colors.accent + '80',
  },
  bracket_tl: {top: 6, left: 6, borderTopWidth: 2, borderLeftWidth: 2},
  bracket_tr: {top: 6, right: 6, borderTopWidth: 2, borderRightWidth: 2},
  bracket_bl: {bottom: 6, left: 6, borderBottomWidth: 2, borderLeftWidth: 2},
  bracket_br: {bottom: 6, right: 6, borderBottomWidth: 2, borderRightWidth: 2},
  playerOffline: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  playerOfflineIcon: {fontSize: 40, marginBottom: spacing.sm},
  playerOfflineTitle: {fontSize: fontSizes.lg, color: colors.text, fontWeight: '600'},
  playerOfflineSub: {fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 4},
  // Zoom
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  zoomLabel: {fontSize: 18},
  zoomTrack: {flex: 1, flexDirection: 'row', gap: spacing.xs},
  zoomStep: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  zoomStepActive: {backgroundColor: colors.accent, borderColor: colors.accent},
  zoomStepText: {fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: '600'},
  zoomStepTextActive: {color: colors.textInverse},
  // PTZ
  ptzSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  ptzTitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.md,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  ptzGrid: {gap: spacing.sm},
  ptzRow: {flexDirection: 'row', justifyContent: 'center', gap: spacing.sm},
  ptzBtn: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.cardLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ptzBtnActive: {backgroundColor: colors.accent + '30', borderColor: colors.accent},
  ptzIcon: {fontSize: 18, color: colors.text},
  ptzCenter: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ptzCenterIcon: {fontSize: 20, color: colors.textSecondary},
  ptzEmpty: {width: 52, height: 52},
  // Toolbar
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  toolbarBtn: {alignItems: 'center', gap: 6},
  toolbarIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  toolbarIcon: {fontSize: 22},
  toolbarLabel: {fontSize: fontSizes.xs, color: colors.textSecondary},
  // Recording Tab
  dateScroll: {marginBottom: spacing.md},
  dateTab: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: spacing.sm,
  },
  dateTabActive: {backgroundColor: colors.accent, borderColor: colors.accent},
  dateTabText: {fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '600'},
  dateTabTextActive: {color: colors.textInverse},
  emptyRec: {alignItems: 'center', paddingTop: 60},
  emptyRecEmoji: {fontSize: 40, marginBottom: spacing.md},
  emptyRecTitle: {fontSize: fontSizes.lg, color: colors.text, fontWeight: '600'},
  emptyRecSub: {fontSize: fontSizes.md, color: colors.textSecondary, marginTop: 4},
  recCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.md,
  },
  recThumb: {width: 80, height: 56, borderRadius: borderRadius.sm, overflow: 'hidden', position: 'relative'},
  recThumbBg: {flex: 1, backgroundColor: '#050E1A', justifyContent: 'center', alignItems: 'center'},
  recThumbIcon: {fontSize: 22, opacity: 0.4},
  recTypeBadge: {
    position: 'absolute', top: 4, left: 4,
    backgroundColor: colors.cardBorder,
    borderRadius: 3, padding: 2,
  },
  recTypeText: {fontSize: 10},
  recInfo: {flex: 1},
  recDate: {fontSize: fontSizes.sm, color: colors.textSecondary},
  recTime: {fontSize: fontSizes.lg, fontWeight: '700', color: colors.text},
  recMeta: {flexDirection: 'row', marginTop: 4},
  recDuration: {fontSize: fontSizes.xs, color: colors.textMuted},
  recSize: {fontSize: fontSizes.xs, color: colors.textMuted},
  recActions: {gap: spacing.sm},
  recBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.cardLight,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  recBtnIcon: {fontSize: 14, color: colors.accent},
  // Settings Tab
  settingsSection: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  settingLeft: {flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1},
  settingIcon: {fontSize: 22},
  settingLabel: {fontSize: fontSizes.md, color: colors.text, fontWeight: '600'},
  settingSub: {fontSize: fontSizes.xs, color: colors.textMuted, marginTop: 2},
  settingCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  settingCardLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  optionRow: {flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap'},
  optionBtn: {
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cardLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  optionBtnActive: {backgroundColor: colors.accent, borderColor: colors.accent},
  optionBtnText: {fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '600'},
  optionBtnTextActive: {color: colors.textInverse},
  sensitivityHeader: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm},
  sensitivityValue: {fontSize: fontSizes.md, color: colors.accent, fontWeight: '700'},
  sensitivityBar: {
    height: 6,
    backgroundColor: colors.cardBorder,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  sensitivityFill: {height: '100%', backgroundColor: colors.accent, borderRadius: 3},
  sensitivityLabels: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 2},
  sensitivityLabelText: {fontSize: fontSizes.xxs, color: colors.textMuted},
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnText: {fontSize: fontSizes.md, fontWeight: '700', color: colors.textInverse},
  // Info Tab
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  infoCardTitle: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder + '60',
  },
  infoLabel: {fontSize: fontSizes.sm, color: colors.textSecondary},
  infoValue: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: '500',
    maxWidth: '55%',
    textAlign: 'right',
  },
  batteryBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  batteryBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.cardBorder,
    borderRadius: 4,
    overflow: 'hidden',
  },
  batteryBarFill: {height: '100%', borderRadius: 4},
  batteryPct: {fontSize: fontSizes.lg, fontWeight: '700', width: 44, textAlign: 'right'},
  batteryWarning: {
    fontSize: fontSizes.xs,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});
