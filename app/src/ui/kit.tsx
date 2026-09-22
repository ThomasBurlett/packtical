import type { ReactNode, Ref } from "react";
import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import { X, type LucideIcon } from "lucide-react-native";

export const colors = {
  ink: "#24313A",
  muted: "#59675F",
  gold: "#F4B942",
  clay: "#A8442E",
  sage: "#7E9B78",
  cream: "#FFF4DE",
  paper: "#FFFDF8",
  line: "#E5DDCD",
  green: "#385C48",
  soft: "#EDF1E7",
};
export const styles = StyleSheet.create({
  title: {
    fontSize: 36,
    fontWeight: "600",
    color: colors.ink,
    letterSpacing: -1.2,
    fontFamily: "Georgia",
  },
  heading: {
    fontSize: 21,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.4,
  },
  body: { fontSize: 16, lineHeight: 24, color: colors.ink },
  muted: { fontSize: 14, lineHeight: 21, color: colors.muted },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "800",
    textTransform: "uppercase",
    color: colors.clay,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  panel: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: colors.ink,
    minHeight: 48,
  },
});
export function Mark({ size = 48 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      accessibilityLabel="Packbee backpack and bee"
    >
      <Path
        d="M34 30V24c0-17 32-17 32 0v6"
        fill="none"
        stroke={colors.ink}
        strokeWidth="6"
      />
      <Rect
        x="18"
        y="25"
        width="64"
        height="65"
        rx="20"
        fill={colors.gold}
        stroke={colors.ink}
        strokeWidth="4"
      />
      <Path
        d="M20 51h60M35 53v8M64 53v8"
        fill="none"
        stroke={colors.ink}
        strokeWidth="4"
      />
      <Rect
        x="32"
        y="68"
        width="36"
        height="15"
        rx="6"
        fill={colors.sage}
        stroke={colors.ink}
        strokeWidth="3"
      />
      <Ellipse
        cx="78"
        cy="22"
        rx="7"
        ry="11"
        fill={colors.paper}
        transform="rotate(-32 78 22)"
      />
      <Ellipse
        cx="90"
        cy="22"
        rx="7"
        ry="11"
        fill={colors.paper}
        transform="rotate(32 90 22)"
      />
      <Ellipse cx="85" cy="34" rx="12" ry="9" fill={colors.ink} />
      <Path d="M82 27v14M89 27v14" stroke={colors.gold} strokeWidth="3" />
      <Circle cx="76" cy="32" r="2" fill={colors.paper} />
    </Svg>
  );
}
export function Landscape() {
  return (
    <Svg
      width="100%"
      height={180}
      viewBox="0 0 720 180"
      preserveAspectRatio="xMidYMid slice"
      accessible={false}
    >
      <Circle cx="570" cy="48" r="30" fill={colors.gold} />
      <Path
        d="M0 160L130 60 230 128 330 44 460 150 610 100 720 140V180H0"
        fill="#E4B69A"
      />
      <Path
        d="M0 180L160 135 280 164 385 104 535 160 635 100 720 150V180"
        fill={colors.sage}
      />
      <Path
        d="M455 180l-45-47 20 47m-20-47 57 9-12 38"
        fill={colors.cream}
        stroke={colors.green}
        strokeWidth="3"
      />
      <Path
        d="M64 150v-44m-15 20 15-22 15 22m-34 12 19-24 19 24"
        stroke={colors.green}
        strokeWidth="4"
        fill="none"
      />
      <Path
        d="M560 171c-45-25-98 0-110 9"
        stroke={colors.paper}
        strokeWidth="3"
        strokeDasharray="5 5"
        fill="none"
      />
    </Svg>
  );
}
export function Button({
  label,
  onPress,
  icon: Icon,
  tone = "primary",
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  tone?: "primary" | "secondary" | "quiet" | "danger";
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: 46,
          paddingHorizontal: 16,
          paddingVertical: 11,
          borderRadius: 12,
          flexDirection: "row",
          gap: 9,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor:
            tone === "primary"
              ? colors.gold
              : tone === "secondary"
                ? colors.soft
                : "transparent",
          opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {Icon && (
        <Icon size={18} color={tone === "danger" ? colors.clay : colors.ink} />
      )}
      <Text
        style={{
          fontSize: 14,
          fontWeight: "700",
          color: tone === "danger" ? colors.clay : colors.ink,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function IconButton({
  label,
  icon: Icon,
  onPress,
  disabled,
}: {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minWidth: 44,
        minHeight: 44,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        backgroundColor: pressed ? colors.line : "transparent",
        opacity: disabled ? 0.3 : 1,
      })}
    >
      <Icon size={20} color={colors.muted} />
    </Pressable>
  );
}
export function Field({
  label,
  inputRef,
  ...props
}: TextInputProps & { label: string; inputRef?: Ref<TextInput> }) {
  return (
    <View style={{ gap: 7 }}>
      <Text style={[styles.muted, { fontWeight: "600" }]}>{label}</Text>
      <TextInput
        ref={inputRef}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        {...props}
        style={[
          styles.input,
          props.multiline && { minHeight: 90, textAlignVertical: "top" },
          props.style,
        ]}
      />
    </View>
  );
}
export function Sheet({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  return (
    <Modal transparent animationType="fade" onRequestClose={close} visible>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          flex: 1,
          backgroundColor: "#24313A66",
          justifyContent: "center",
          alignItems: "center",
          padding: 18,
        }}
      >
        <View
          accessibilityViewIsModal
          style={{
            width: "100%",
            maxWidth: 500,
            maxHeight: "90%",
            borderRadius: 24,
            backgroundColor: colors.cream,
            padding: 20,
          }}
        >
          <View
            style={[
              styles.row,
              { justifyContent: "space-between", marginBottom: 14 },
            ]}
          >
            <Text accessibilityRole="header" style={styles.heading}>
              {title}
            </Text>
            <IconButton label="Close dialog" icon={X} onPress={close} />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 16, paddingBottom: 12 }}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
