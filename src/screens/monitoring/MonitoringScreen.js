import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
} from 'react-native';
import {useApp} from '../../context/AppContext';
import {colors, spacing, fontSizes, borderRadius} from '../../theme';

const {width} = Dimensions.get('window');

const FILTERS = [
  {key: 'all', label: 'Semua'},
  {key: 'online', label: 'Online'},
  {key: 'offline', label: 'Offline'},
  {key: 'recording', label: 'Merekam'},
];

// ─── Camera Card (Grid) ────────────────────────────────────────────────────────
function CameraCardGrid({camera, onPress}) {
  const isOnline = camera.status === 'online';

  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.85}>
      {/* Video preview area */}
      <View style={styles.gridPreview}>
        <View style={styles.gridFeedBg}>
          <Text style={styles.gridCamIcon}>{isOnline ? '📹' : '📷'}</Text>
        </View>

        {/* Top badges */}
        <View style={styles.gridTopBadges}>
          {isOnline && camera.isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          {camera.isRecording && (
            <View style={styles.recBadge}>
              <Text style={styles.recText}>⏺ REC</Text>
            </View>
          )}
        </View>

        {/* Bottom badges */}
        <View style={styles.gridBottomBadges}>
          {camera.hasMotion && (
            <View style={styles.motionBadge}>
              <Text style={styles.motionText}>〰 Gerakan</Text>
            </View>
          )}
          {camera.isBatteryLow && (
            <View style={styles.batteryBadge}>
              <Text style={styles.batteryText}>🔋 {camera.batteryLevel}%</Text>
            </View>
          )}
        </View>

        {/* Offline overlay */}
        {!isOnline && (
          <View style={styles.offlineOverlay}>
            <Text style={styles.offlineIcon}>📵</Text>
            <Text style={styles.offlineLabel}>Offline</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.gridInfo}>
        <View style={styles.gridInfoLeft}>
          <Text style={styles.gridCamName} numberOfLines={1}>{camera.name}</Text>
          <Text style={styles.gridCamLocation} numberOfLines={1}>{camera.location}</Text>
        </View>
        <View style={[styles.statusIndicator, {backgroundColor: isOnline ? colors.success : colors.offline}]} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Camera Card (List) ────────────────────────────────────────────────────────
function CameraCardList({camera, onPress}) {
  const isOnline = camera.status === 'online';

  return (
    <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.85}>
      {/* Thumbnail */}
      <View style={styles.listThumb}>
        <View style={styles.listThumbBg}>
          <Text style={styles.listThumbIcon}>{isOnline ? '📹' : '📷'}</Text>
        </View>
        {camera.isRecording && (
          <View style={styles.listRecBadge}>
            <Text style={styles.listRecText}>⏺</Text>
          </View>
        )}
        {!isOnline && (
          <View style={styles.listOfflineOverlay}>
            <Text style={{fontSize: 12}}>📵</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.listInfo}>
        <View style={styles.listInfoTop}>
          <Text style={styles.listCamName} numberOfLines={1}>{camera.name}</Text>
          <View style={styles.listBadgeRow}>
            {camera.isLive && isOnline && (
              <View style={styles.liveBadgeSmall}>
                <Text style={styles.liveBadgeSmallText}>LIVE</Text>
              </View>
            )}
            {camera.hasMotion && (
              <View style={styles.motionBadgeSmall}>
                <Text style={styles.motionBadgeSmallText}>〰</Text>
              </View>
            )}
            {camera.isBatteryLow && (
              <View style={styles.batteryBadgeSmall}>
                <Text style={styles.batteryBadgeSmallText}>🔋{camera.batteryLevel}%</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.listCamLocation} numberOfLines={1}>{camera.location}</Text>
        <View style={styles.listMetaRow}>
          <View style={[styles.statusDotSmall, {backgroundColor: isOnline ? colors.success : colors.offline}]} />
          <Text style={[styles.listStatus, {color: isOnline ? colors.success : colors.offline}]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          <Text style={styles.listLastSeen}> · {camera.lastSeen}</Text>
          <Text style={styles.listResolution}> · {camera.resolution}</Text>
        </View>
      </View>

      <Text style={styles.listArrow}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({stats}) {
  const items = [
    {label: 'Total', value: stats.total, color: colors.accent},
    {label: 'Online', value: stats.online, color: colors.success},
    {label: 'Merekam', value: stats.recording, color: colors.warning},
    {label: 'Offline', value: stats.offline, color: colors.danger},
  ];
  return (
    <View style={styles.statsBar}>
      {items.map((item, idx) => (
        <React.Fragment key={item.label}>
          <View style={styles.statBarItem}>
            <Text style={[styles.statBarValue, {color: item.color}]}>{item.value}</Text>
            <Text style={styles.statBarLabel}>{item.label}</Text>
          </View>
          {idx < items.length - 1 && <View style={styles.statBarDivider} />}
        </React.Fragment>
      ))}
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MonitoringScreen({navigation}) {
  const {cameras, stats} = useApp();
  const [viewMode, setViewMode] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCameras = useMemo(() => {
    let list = cameras;
    // Filter
    if (activeFilter === 'online') {
      list = list.filter(c => c.status === 'online');
    } else if (activeFilter === 'offline') {
      list = list.filter(c => c.status === 'offline');
    } else if (activeFilter === 'recording') {
      list = list.filter(c => c.isRecording);
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.model.toLowerCase().includes(q),
      );
    }
    return list;
  }, [cameras, activeFilter, searchQuery]);

  const renderCamera = ({item}) => {
    const onPress = () =>
      navigation.navigate('CameraDetail', {cameraId: item.id});

    return viewMode === 'grid' ? (
      <CameraCardGrid camera={item} onPress={onPress} />
    ) : (
      <CameraCardList camera={item} onPress={onPress} />
    );
  };

  const filterCount = key => {
    if (key === 'all') return cameras.length;
    if (key === 'online') return stats.online;
    if (key === 'offline') return stats.offline;
    if (key === 'recording') return stats.recording;
    return 0;
  };

  return (
    <View style={styles.container}>
      {/* Stats Bar */}
      <StatsBar stats={stats} />

      {/* Search + View Toggle */}
      <View style={styles.searchRow}>
        <View style={styles.searchInput}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchText}
            placeholder="Cari kamera, lokasi..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewBtn, viewMode === 'grid' && styles.viewBtnActive]}
            onPress={() => setViewMode('grid')}>
            <Text style={styles.viewBtnIcon}>⊞</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewBtn, viewMode === 'list' && styles.viewBtnActive]}
            onPress={() => setViewMode('list')}>
            <Text style={styles.viewBtnIcon}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterTab,
              activeFilter === f.key && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(f.key)}>
            <Text
              style={[
                styles.filterText,
                activeFilter === f.key && styles.filterTextActive,
              ]}>
              {f.label}
            </Text>
            <View style={[
              styles.filterCount,
              activeFilter === f.key && styles.filterCountActive,
            ]}>
              <Text style={[
                styles.filterCountText,
                activeFilter === f.key && styles.filterCountTextActive,
              ]}>
                {filterCount(f.key)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Camera List */}
      <FlatList
        data={filteredCameras}
        keyExtractor={item => item.id}
        renderItem={renderCamera}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        contentContainerStyle={[
          styles.listContent,
          viewMode === 'grid' && styles.gridContent,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📷</Text>
            <Text style={styles.emptyTitle}>Tidak ada kamera</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? `Tidak ada hasil untuk "${searchQuery}"`
                : 'Tidak ada kamera dengan filter ini'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const TILE_SIZE = (width - spacing.lg * 2 - spacing.sm) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  // Stats bar
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingVertical: spacing.sm,
  },
  statBarItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBarValue: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
  },
  statBarLabel: {
    fontSize: fontSizes.xxs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  statBarDivider: {
    width: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 4,
  },
  // Search row
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.sm,
    height: 40,
  },
  searchIcon: {fontSize: 14, marginRight: spacing.xs},
  searchText: {
    flex: 1,
    color: colors.text,
    fontSize: fontSizes.md,
    paddingVertical: 0,
  },
  searchClear: {
    color: colors.textMuted,
    fontSize: fontSizes.md,
    paddingLeft: spacing.sm,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  viewBtn: {
    width: 36,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewBtnActive: {
    backgroundColor: colors.accent,
  },
  viewBtnIcon: {
    fontSize: 16,
    color: colors.text,
  },
  // Filter
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 4,
  },
  filterTabActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {color: colors.textInverse},
  filterCount: {
    backgroundColor: colors.cardBorder,
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterCountActive: {backgroundColor: colors.textInverse + '30'},
  filterCountText: {fontSize: 9, color: colors.textSecondary, fontWeight: '700'},
  filterCountTextActive: {color: colors.textInverse},
  // List content
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  gridContent: {
    gap: spacing.sm,
  },
  // Grid Card
  gridCard: {
    width: TILE_SIZE,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  gridPreview: {
    height: 110,
    position: 'relative',
  },
  gridFeedBg: {
    flex: 1,
    backgroundColor: '#050E1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridCamIcon: {fontSize: 28, opacity: 0.25},
  gridTopBadges: {
    position: 'absolute',
    top: 4,
    left: 4,
    flexDirection: 'row',
    gap: 3,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.live,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 3,
  },
  liveText: {fontSize: 8, color: '#fff', fontWeight: '700', letterSpacing: 0.5},
  recBadge: {
    backgroundColor: colors.recording + 'CC',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  recText: {fontSize: 8, color: '#fff', fontWeight: '700'},
  gridBottomBadges: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    gap: 3,
  },
  motionBadge: {
    backgroundColor: colors.warning + 'DD',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  motionText: {fontSize: 8, color: colors.textInverse, fontWeight: '700'},
  batteryBadge: {
    backgroundColor: colors.battery + 'DD',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  batteryText: {fontSize: 8, color: '#fff', fontWeight: '700'},
  offlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,22,40,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineIcon: {fontSize: 24},
  offlineLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gridInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  gridInfoLeft: {flex: 1},
  gridCamName: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: '600',
  },
  gridCamLocation: {
    fontSize: fontSizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  // List Card
  listCard: {
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
  listThumb: {
    width: 72,
    height: 52,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  listThumbBg: {
    flex: 1,
    backgroundColor: '#050E1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listThumbIcon: {fontSize: 20, opacity: 0.3},
  listRecBadge: {
    position: 'absolute',
    top: 3,
    left: 3,
    backgroundColor: colors.recording + 'CC',
    borderRadius: 3,
    padding: 2,
  },
  listRecText: {fontSize: 8, color: '#fff'},
  listOfflineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,22,40,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listInfo: {flex: 1},
  listInfoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  listCamName: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  listBadgeRow: {
    flexDirection: 'row',
    gap: 3,
    marginLeft: spacing.sm,
  },
  liveBadgeSmall: {
    backgroundColor: colors.live,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  liveBadgeSmallText: {fontSize: 8, color: '#fff', fontWeight: '700'},
  motionBadgeSmall: {
    backgroundColor: colors.warning + 'CC',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  motionBadgeSmallText: {fontSize: 9, color: colors.textInverse},
  batteryBadgeSmall: {
    backgroundColor: colors.battery + 'CC',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  batteryBadgeSmallText: {fontSize: 8, color: '#fff'},
  listCamLocation: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginBottom: 3,
  },
  listMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  listStatus: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  listLastSeen: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  listResolution: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  listArrow: {
    fontSize: 22,
    color: colors.textMuted,
  },
  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {fontSize: 48, marginBottom: spacing.md},
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
