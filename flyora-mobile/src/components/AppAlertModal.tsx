import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Shadows } from '../constants/theme';

const { width } = Dimensions.get('window');

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface AlertOptions {
  title: string;
  message: string;
  type?: AlertType;
  buttons?: AlertButton[];
  autoCloseTime?: number;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  showSuccess: (title: string, message: string, onDone?: () => void) => void;
  showError: (title: string, message: string, onRetry?: () => void) => void;
  showWarning: (title: string, message: string) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText?: string,
    cancelText?: string,
    isDestructive?: boolean
  ) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Standalone global ref for drop-in Alert replacement across any screen/service
export class AppAlert {
  private static alertInstance: AlertContextType | null = null;

  static setInstance(instance: AlertContextType) {
    AppAlert.alertInstance = instance;
  }

  static alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: { cancelable?: boolean; type?: AlertType }
  ) {
    if (AppAlert.alertInstance) {
      AppAlert.alertInstance.showAlert({
        title,
        message: message || '',
        buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'OK', style: 'default' }],
        type: options?.type || (title.toLowerCase().includes('error') || title.toLowerCase().includes('fail') ? 'error' : title.toLowerCase().includes('success') ? 'success' : 'info'),
      });
    } else {
      console.log(`[AppAlert] ${title}: ${message}`);
    }
  }

  static success(title: string, message: string, onDone?: () => void) {
    AppAlert.alertInstance?.showSuccess(title, message, onDone);
  }

  static error(title: string, message: string, onRetry?: () => void) {
    AppAlert.alertInstance?.showError(title, message, onRetry);
  }

  static warning(title: string, message: string) {
    AppAlert.alertInstance?.showWarning(title, message);
  }

  static confirm(
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false
  ) {
    AppAlert.alertInstance?.showConfirm(title, message, onConfirm, confirmText, cancelText, isDestructive);
  }
}

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertOptions>({
    title: '',
    message: '',
    type: 'success',
    buttons: [{ text: 'OK', style: 'default' }],
  });

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<any>(null);

  const hideAlert = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.88,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  }, [scaleAnim, opacityAnim]);

  const showAlert = useCallback(
    (options: AlertOptions) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      setConfig({
        title: options.title,
        message: options.message,
        type: options.type || 'info',
        buttons: options.buttons || [{ text: 'Done', style: 'default' }],
      });

      setVisible(true);

      // Reset and trigger entrance animation with smooth spring physics
      scaleAnim.setValue(0.75);
      opacityAnim.setValue(0);
      pulseAnim.setValue(1);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6.5,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Soft icon pulse
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(pulseAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();

      if (options.autoCloseTime) {
        timerRef.current = setTimeout(() => {
          hideAlert();
        }, options.autoCloseTime);
      }
    },
    [scaleAnim, opacityAnim, pulseAnim, hideAlert]
  );

  const showSuccess = useCallback(
    (title: string, message: string, onDone?: () => void) => {
      showAlert({
        title,
        message,
        type: 'success',
        buttons: [
          {
            text: 'Great, Continue',
            style: 'default',
            onPress: onDone,
          },
        ],
      });
    },
    [showAlert]
  );

  const showError = useCallback(
    (title: string, message: string, onRetry?: () => void) => {
      showAlert({
        title,
        message,
        type: 'error',
        buttons: onRetry
          ? [
              { text: 'Dismiss', style: 'cancel' },
              { text: 'Try Again', style: 'default', onPress: onRetry },
            ]
          : [{ text: 'Understood', style: 'default' }],
      });
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (title: string, message: string) => {
      showAlert({
        title,
        message,
        type: 'warning',
        buttons: [{ text: 'OK', style: 'default' }],
      });
    },
    [showAlert]
  );

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      isDestructive = false
    ) => {
      showAlert({
        title,
        message,
        type: 'confirm',
        buttons: [
          {
            text: cancelText,
            style: 'cancel',
          },
          {
            text: confirmText,
            style: isDestructive ? 'destructive' : 'default',
            onPress: onConfirm,
          },
        ],
      });
    },
    [showAlert]
  );

  // Link AppAlert static helper
  useEffect(() => {
    AppAlert.setInstance({
      showAlert,
      showSuccess,
      showError,
      showWarning,
      showConfirm,
      hideAlert,
    });
  }, [showAlert, showSuccess, showError, showWarning, showConfirm, hideAlert]);

  // Visual Theme Configuration based on type
  const getTheme = () => {
    switch (config.type) {
      case 'success':
        return {
          icon: 'shield-checkmark',
          gradient: ['#089A8D', '#046A61'] as const,
          lightBg: '#ECFDF5',
          ringColor: 'rgba(16, 185, 129, 0.22)',
          primaryColor: '#089A8D',
          badgeText: 'ACTION SUCCESSFUL',
        };
      case 'error':
        return {
          icon: 'alert-circle',
          gradient: ['#EF4444', '#DC2626'] as const,
          lightBg: '#FEF2F2',
          ringColor: 'rgba(239, 68, 68, 0.22)',
          primaryColor: '#EF4444',
          badgeText: 'ACTION REQUIRED',
        };
      case 'warning':
        return {
          icon: 'warning',
          gradient: ['#F59E0B', '#D97706'] as const,
          lightBg: '#FFFBEB',
          ringColor: 'rgba(245, 158, 11, 0.22)',
          primaryColor: '#F59E0B',
          badgeText: 'ATTENTION',
        };
      case 'confirm':
        return {
          icon: 'help-circle',
          gradient: ['#089A8D', '#034E47'] as const,
          lightBg: '#F0FDFA',
          ringColor: 'rgba(8, 154, 141, 0.22)',
          primaryColor: '#089A8D',
          badgeText: 'CONFIRM ACTION',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle',
          gradient: ['#089A8D', '#0F766E'] as const,
          lightBg: '#F0FDFA',
          ringColor: 'rgba(8, 154, 141, 0.2)',
          primaryColor: '#089A8D',
          badgeText: 'FLYORAGO NOTICE',
        };
    }
  };

  const theme = getTheme();

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showConfirm,
        hideAlert,
      }}
    >
      {children}

      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={hideAlert}
      >
        <View style={styles.backdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={hideAlert}
          />

          <Animated.View
            style={[
              styles.modalCard,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Top Glowing Ambient Orb */}
            <View
              style={[
                styles.ambientGlow,
                { backgroundColor: theme.ringColor },
              ]}
            />

            {/* Header Badge */}
            <View style={[styles.typeBadge, { backgroundColor: theme.lightBg }]}>
              <Text style={[styles.typeBadgeText, { color: theme.primaryColor }]}>
                {theme.badgeText}
              </Text>
            </View>

            {/* Glowing Icon Hub with Soft Animated Pulse */}
            <Animated.View
              style={[
                styles.iconOuterRing,
                {
                  backgroundColor: theme.lightBg,
                  borderColor: theme.ringColor,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={theme.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconInnerCircle}
              >
                <Ionicons name={theme.icon as any} size={32} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>

            {/* Title & Body */}
            <Text style={styles.modalTitle}>{config.title}</Text>
            <Text style={styles.modalMessage}>{config.message}</Text>

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              {config.buttons?.map((btn, index) => {
                const isCancel = btn.style === 'cancel';
                const isDestructive = btn.style === 'destructive';

                if (isCancel) {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.cancelBtn}
                      activeOpacity={0.75}
                      onPress={() => {
                        hideAlert();
                        btn.onPress?.();
                      }}
                    >
                      <Text style={styles.cancelBtnText}>{btn.text}</Text>
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.primaryBtnWrapper}
                    activeOpacity={0.85}
                    onPress={() => {
                      hideAlert();
                      btn.onPress?.();
                    }}
                  >
                    <LinearGradient
                      colors={isDestructive ? ['#EF4444', '#DC2626'] : theme.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryBtnGradient}
                    >
                      <Text style={styles.primaryBtnText}>{btn.text}</Text>
                      <Ionicons
                        name={isDestructive ? 'trash-outline' : 'arrow-forward'}
                        size={15}
                        color="#FFFFFF"
                        style={{ marginLeft: 6 }}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

export const useAppAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAppAlert must be used within an AlertProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 20, 18, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: Math.min(width - 48, 380),
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6FAF6',
    ...Shadows.cardHover,
    shadowColor: '#044C47',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  ambientGlow: {
    position: 'absolute',
    top: -60,
    width: 220,
    height: 140,
    borderRadius: 110,
    opacity: 0.8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  iconOuterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconInnerCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#062738',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  modalMessage: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#64748B',
  },
  primaryBtnWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    paddingVertical: 13,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
