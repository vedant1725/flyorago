import React, { useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { toQR } from 'toqr';

interface NativeQRCodeProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  quietZoneModules?: number;
  style?: StyleProp<ViewStyle>;
}

export const NativeQRCode: React.FC<NativeQRCodeProps> = ({
  value,
  size = 200,
  color = '#000000',
  backgroundColor = '#FFFFFF',
  quietZoneModules = 2,
  style,
}) => {
  const { runs, totalModules, moduleSize } = useMemo(() => {
    if (!value || typeof value !== 'string') {
      return { runs: [], totalModules: 0, moduleSize: 0 };
    }

    try {
      const bytes = toQR(value);
      const dimension = Math.round(Math.sqrt(bytes.length));
      if (!dimension || dimension * dimension !== bytes.length) {
        return { runs: [], totalModules: 0, moduleSize: 0 };
      }

      const totalModules = dimension + quietZoneModules * 2;
      const moduleSize = size / totalModules;

      // Group consecutive black modules in each row into single horizontal bars (runs)
      // This dramatically reduces the number of rendered Views (e.g. from 300 to ~40)
      const runs: Array<{ row: number; colStart: number; length: number }> = [];

      for (let y = 0; y < dimension; y++) {
        let currentRunStart = -1;
        let currentRunLength = 0;

        for (let x = 0; x < dimension; x++) {
          const isDark = bytes[y * dimension + x] === 1;
          if (isDark) {
            if (currentRunStart === -1) {
              currentRunStart = x;
              currentRunLength = 1;
            } else {
              currentRunLength++;
            }
          } else {
            if (currentRunStart !== -1) {
              runs.push({
                row: y + quietZoneModules,
                colStart: currentRunStart + quietZoneModules,
                length: currentRunLength,
              });
              currentRunStart = -1;
              currentRunLength = 0;
            }
          }
        }

        if (currentRunStart !== -1) {
          runs.push({
            row: y + quietZoneModules,
            colStart: currentRunStart + quietZoneModules,
            length: currentRunLength,
          });
        }
      }

      return { runs, totalModules, moduleSize };
    } catch (err) {
      console.warn('Failed to encode QR code:', err);
      return { runs: [], totalModules: 0, moduleSize: 0 };
    }
  }, [value, size, quietZoneModules]);

  if (!runs.length || !totalModules || !moduleSize) {
    return (
      <View
        style={[
          styles.container,
          { width: size, height: size, backgroundColor },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor,
        },
        style,
      ]}
    >
      {runs.map((run, idx) => (
        <View
          key={idx}
          style={{
            position: 'absolute',
            left: run.colStart * moduleSize,
            top: run.row * moduleSize,
            width: run.length * moduleSize + 0.1, // tiny overlap prevents 1px rendering seams
            height: moduleSize + 0.1,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
