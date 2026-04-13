import React, {useState, useMemo, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import {useApp} from '../context/AppContext';
import {colors, spacing, fontSizes, borderRadius} from '../theme';

const CATEGORIES = [
  {key: 'all', label: 'Semua', icon: '🔔'},
  {key: 'motion', label: 'Gerakan', icon: '〰️'},
  {key: 'offline', label: 'Offline', icon: '📵'},
  {key: 'battery', label: 'Baterai', icon: '🔋'},
  {key: 'system', label: 'Sistem', icon: '⚙️'},
];

// ─── Alert Item ───────────────────────────────────────────────────────────────
function AlertItem({alert, onMarkRead, onDelete, onNavigate}) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [showActions, setShowActions] = useState(false);

  const severityConfig = {
    high: {color: colors.danger, bg: colors.dangerLight, label: 'Tinggi', border: colors.danger},
    medium: {color: colors.warning, bg: colors.warningLight, label: 'Sedang', border: colors.warning},
    low: {color: colors.info, bg: colors.infoLight, label: 'Rendah', border: colors.info},
  };
  const severity = severityConfig[alert.severity] || severityConfig.low;

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {toValue: -400, duration: 300, useNativeDriver: true}),
      Animated.timing(opacityAnim, {toValue: 0, duration: 300, useNativeDriver: true}),
    ]).start(() => onDelete(alert.id));
  };

  const categoryColors = {
    motion: colors.warning,
    offline: colors.textMuted,
    battery: colors.battery,
    system: colors.info,
  };
  const catColor = categoryColors[alert.category] || colors.textSecondary;

  return (
    <Animated.View
      style={[
        styles.alertItemWrap,
        {
          transform: [{translateX: slideAnim}],
          opacity: opacityAnim,
        },
      ]}>
      <TouchableOpacity
        style={[
          styles.alertItem,
          !alert.isRead && styles.alertItemUnread,
          {borderLeftColor: severity.color},
        ]}
        onPress={() => {
          if (!alert.isRead) onMarkRead(alert.id);
          setShowActions(p => !p);
        }}
        onLongPress={() => setShowActions(p => !p)}
        activeOpacity={0.85}>

        {/* Icon */}
        <View style={[styles.alertIconCircle, {backgroundColor: severity.bg}]}>
          <Text style={styles.alertEmoji}>{alert.icon}</Text>
        </View>

        {/* Content */}
        <View style={styles.alertContent}>
          <View style={styles.alertTopRow}>
            <Text style={styles.alertTitle} numberOfLines={1}>{alert.title}</Text>
            <View style={styles.alertMetaRight}>
              {!alert.isRead && <View style={styles.unreadDot} />}
              <View style={[styles.severityBadge, {backgroundColor: severity.bg, borderColor: severity.border}]}>
                <Text style={[styles.severityText, {color: severity.color}]}>
                  {severity.label}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.alertMessage} numberOfLines={showActions ? undefined : 2}>
            {alert.message}
          </Text>

          <View style={styles.alertFooter}>
            <View style={[styles.catTag, {backgroundColor: catColor + '20'}]}>
              <Text style={[styles.catTagText, {color: catColor}]}>
                {CATEGORIES.find(c => c.key === alert.category)?.icon}{' '}
                {CATEGORIES.find(c => c.key === alert.category)?.label}
              </Text>
            </View>
            <Text style={styles.alertTime}>{alert.date} · {alert.time}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Expanded Actions */}
      {showActions && (
        <View style={styles.alertActions}>
          {!alert.isRead && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnRead]}
              onPress={() => {onMarkRead(alert.id); setShowActions(false);}}>
              <Text style={styles.actionBtnIcon}>✓</Text>
              <Text style={styles.actionBtnText}>Tandai Dibaca</Text>
            </TouchableOpacity>
          )}
          {alert.cameraId && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnCamera]}
              onPress={() => onNavigate(alert.cameraId)}>
              <Text style={styles.actionBtnIcon}>📹</Text>
              <Text style={styles.actionBtnText}>Lihat Kamera</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDelete]}
            onPress={handleDelete}>
            <Text style={styles.actionBtnIcon}>🗑</Text>
            <Text style={[styles.actionBtnText, {color: colors.danger}]}>Hapus</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AlertsScreen({navigation}) {
  const {alerts, unreadCount, markAlertRead, markAllRead, deleteAlert, clearAllAlerts} = useApp();
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredAlerts = useMemo(() => {
    if (activeCategory === 'all') return alerts;
    return alerts.filter(a => a.category === activeCategory);
  }, [alerts, activeCategory]);

  const categoryCount = key => {
    if (key === 'all') return alerts.length;
    return alerts.filter(a => a.category === key).length;
  };

  const handleClearAll = () => {
    Alert.alert(
      'Hapus Semua Peringatan',
      'Yakin ingin menghapus semua peringatan?',
      [
        {text: 'Batal', style: 'cancel'},
        {text: 'Hapus', style: 'destructive', onPress: clearAllAlerts},
      ],
    );
  };

  const handleNavigate = cameraId => {
    navigation.navigate('Monitoring', {screen: 'CameraDetail', params: {cameraId}});
  };

  const unreadInFilter = filteredAlerts.filter(a => !a.isRead).length;

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      <View style={styles.headerActions}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerCount}>
            {alerts.length} peringatan
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} belum dibaca</Text>
            </View>
          )}
        </View>
        <View style={styles.headerButtons}>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.headerBtn} onPress={markAllRead}>
              <Text style={styles.headerBtnText}>✓ Baca Semua</Text>
            </TouchableOpacity>
          )}
          {alerts.length > 0 && (
            <TouchableOpacity
              style={[styles.headerBtn, styles.headerBtnDanger]}
              onPress={handleClearAll}>
              <Text style={[styles.headerBtnText, {color: colors.danger}]}>🗑 Hapus</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filters */}
      <View style={styles.categoryScroll}>
        {CATEGORIES.map(cat => {
          const count = categoryCount(cat.key);
          const isActive = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.catBtn, isActive && styles.catBtnActive]}
              onPress={() => setActiveCategory(cat.key)}>
              <Text style={styles.catBtnIcon}>{cat.icon}</Text>
              <Text style={[styles.catBtnLabel, isActive && styles.catBtnLabelActive]}>
                {cat.label}
              </Text>
              {count > 0 && (
                <View style={[styles.catCount, isActive && styles.catCountActive]}>
                  <Text style={[styles.catCountText, isActive && styles.catCountTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Mark filter unread */}
      {unreadInFilter > 0 && (
        <View style={styles.filterUnreadBar}>
          <Text style={styles.filterUnreadText}>
            {unreadInFilter} belum dibaca dalam filter ini
          </Text>
          <TouchableOpacity onPress={() => filteredAlerts.filter(a => !a.isRead).forEach(a => markAlertRead(a.id))}>
            <Text style={styles.filterUnreadAction}>Baca Semua</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Alert List */}
      <FlatList
        data={filteredAlerts}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <AlertItem
            alert={item}
            onMarkRead={markAlertRead}
            onDelete={deleteAlert}
            onNavigate={handleNavigate}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔕</Text>
            <Text style={styles.emptyTitle}>Tidak ada peringatan</Text>
            <Text style={styles.emptySubtitle}>
              {activeCategory === 'all'
                ? 'Semua aman, tidak ada peringatan baru.'
                : `Tidak ada peringatan kategori ${CATEGORIES.find(c => c.key === activeCategory)?.label}`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.primary},
  // Header
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  headerLeft: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  headerCount: {fontSize: fontSizes.md, fontWeight: '700', color: colors.text},
  unreadBadge: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  unreadBadgeText: {fontSize: fontSizes.xs, color: colors.textInverse, fontWeight: '700'},
  headerButtons: {flexDirection: 'row', gap: spacing.sm},
  headerBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.cardLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  headerBtnDanger: {borderColor: colors.danger + '40'},
  headerBtnText: {fontSize: fontSizes.xs, color: colors.accent, fontWeight: '600'},
  // Categories
  categoryScroll: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 3,
  },
  catBtnActive: {backgroundColor: colors.accent, borderColor: colors.accent},
  catBtnIcon: {fontSize: 12},
  catBtnLabel: {fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: '600'},
  catBtnLabelActive: {color: colors.textInverse},
  catCount: {
    backgroundColor: colors.cardBorder,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  catCountActive: {backgroundColor: colors.textInverse + '30'},
  catCountText: {fontSize: 9, color: colors.textSecondary, fontWeight: '700'},
  catCountTextActive: {color: colors.textInverse},
  // Filter unread bar
  filterUnreadBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    backgroundColor: colors.accentLight,
  },
  filterUnreadText: {fontSize: fontSizes.xs, color: colors.accent},
  filterUnreadAction: {fontSize: fontSizes.xs, color: colors.accent, fontWeight: '700'},
  // List
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  // Alert Item
  alertItemWrap: {
    overflow: 'hidden',
  },
  alertItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderLeftWidth: 3,
  },
  alertItemUnread: {
    backgroundColor: colors.cardLight,
  },
  alertIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  alertEmoji: {fontSize: 20},
  alertContent: {flex: 1},
  alertTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
    marginRight: spacing.sm,
  },
  alertMetaRight: {flexDirection: 'row', alignItems: 'center', gap: spacing.xs},
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  severityBadge: {
    borderRadius: borderRadius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  severityText: {fontSize: fontSizes.xxs, fontWeight: '700'},
  alertMessage: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catTag: {
    borderRadius: borderRadius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  catTagText: {fontSize: fontSizes.xxs, fontWeight: '600'},
  alertTime: {fontSize: fontSizes.xs, color: colors.textMuted},
  // Actions
  alertActions: {
    flexDirection: 'row',
    backgroundColor: colors.cardLight,
    borderRadius: borderRadius.md,
    marginTop: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: 4,
    borderRightWidth: 1,
    borderRightColor: colors.cardBorder,
  },
  actionBtnRead: {},
  actionBtnCamera: {},
  actionBtnDelete: {},
  actionBtnIcon: {fontSize: 14},
  actionBtnText: {fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: '600'},
  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {fontSize: 52, marginBottom: spacing.md},
  emptyTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
