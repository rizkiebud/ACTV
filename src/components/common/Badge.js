import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, fontSizes, borderRadius} from '../../theme';

export default function Badge({label, variant = 'default', size = 'sm', dot = false, style}) {
  if (dot) {
    return (
      <View style={[styles.dot, styles[`dot_${variant}`], style]} />
    );
  }

  return (
    <View style={[styles.badge, styles[`badge_${variant}`], styles[`size_${size}`], style]}>
      <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`]]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Badge variants
  badge_live: {backgroundColor: colors.live},
  badge_recording: {backgroundColor: colors.recording},
  badge_offline: {backgroundColor: colors.offline},
  badge_online: {backgroundColor: colors.success},
  badge_motion: {backgroundColor: colors.warning},
  badge_battery: {backgroundColor: colors.battery},
  badge_default: {backgroundColor: colors.cardBorder},
  badge_accent: {backgroundColor: colors.accent},
  badge_danger: {backgroundColor: colors.danger},
  badge_success: {backgroundColor: colors.success},
  badge_warning: {backgroundColor: colors.warning},
  badge_high: {backgroundColor: colors.dangerLight, borderWidth: 1, borderColor: colors.danger},
  badge_medium: {backgroundColor: colors.warningLight, borderWidth: 1, borderColor: colors.warning},
  badge_low: {backgroundColor: colors.infoLight, borderWidth: 1, borderColor: colors.info},

  // Label colors
  label_live: {color: '#FFFFFF'},
  label_recording: {color: '#FFFFFF'},
  label_offline: {color: '#FFFFFF'},
  label_online: {color: '#FFFFFF'},
  label_motion: {color: colors.textInverse},
  label_battery: {color: '#FFFFFF'},
  label_default: {color: colors.textSecondary},
  label_accent: {color: colors.textInverse},
  label_danger: {color: '#FFFFFF'},
  label_success: {color: '#FFFFFF'},
  label_warning: {color: colors.textInverse},
  label_high: {color: colors.danger},
  label_medium: {color: colors.warning},
  label_low: {color: colors.info},

  // Sizes
  size_xs: {paddingVertical: 2, paddingHorizontal: 5},
  size_sm: {paddingVertical: 3, paddingHorizontal: 7},
  size_md: {paddingVertical: 5, paddingHorizontal: 10},

  labelSize_xs: {fontSize: fontSizes.xxs},
  labelSize_sm: {fontSize: fontSizes.xs},
  labelSize_md: {fontSize: fontSizes.sm},

  // Dot variants
  dot_live: {backgroundColor: colors.live},
  dot_online: {backgroundColor: colors.success},
  dot_offline: {backgroundColor: colors.offline},
  dot_recording: {backgroundColor: colors.recording},
  dot_motion: {backgroundColor: colors.warning},
  dot_default: {backgroundColor: colors.textMuted},
});
