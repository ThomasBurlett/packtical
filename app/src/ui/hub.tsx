import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import {
  ArrowUpRight,
  Bike,
  Mountain,
  Plane,
  Search,
  Snowflake,
  type LucideIcon,
} from "lucide-react-native";
import { CHECKLISTS } from "@/domain/catalogue";
import { colors, Landscape, styles } from "./kit";

const icons: Record<string, LucideIcon> = {
  Outdoor: Mountain,
  Travel: Plane,
  Cycling: Bike,
  Snow: Snowflake,
};
export function Hub({ open }: { open: (slug: string) => void }) {
  const [query, setQuery] = useState("");
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 24, gap: 26, paddingBottom: 40 }}
    >
      <View
        style={{
          backgroundColor: colors.cream,
          borderRadius: 24,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.line,
        }}
      >
        <View style={{ padding: 24, paddingBottom: 0, gap: 12 }}>
          <Text style={styles.eyebrow}>A little prep. A lot more outside.</Text>
          <Text
            accessibilityRole="header"
            style={[styles.title, { fontSize: 40 }]}
          >
            Good things ahead.
          </Text>
          <Text style={[styles.body, { color: colors.muted, maxWidth: 420 }]}>
            Find your checklist. Make it yours.{"\n"}Leave with a little less on
            your mind.
          </Text>
        </View>
        <Landscape />
      </View>
      <View style={[styles.row, styles.input]}>
        <Search size={20} color={colors.muted} />
        <TextInput
          accessibilityLabel="Find an activity"
          placeholder="Find an activity"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          style={{ flex: 1, fontSize: 16, color: colors.ink, minHeight: 24 }}
        />
      </View>
      {Object.entries(icons).map(([category, Icon]) => {
        const lists = CHECKLISTS.filter(
          (list) =>
            list.category === category &&
            `${list.label} ${list.summary}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        );
        if (!lists.length) return null;
        return (
          <View key={category} style={{ gap: 12 }}>
            <View style={styles.row}>
              <Icon size={18} color={colors.clay} />
              <Text accessibilityRole="header" style={styles.heading}>
                {category}
              </Text>
              <Text style={styles.muted}>{lists.length}</Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {lists.map((list) => (
                <Pressable
                  key={list.slug}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${list.label}`}
                  onPress={() => open(list.slug)}
                  style={({ pressed }) => ({
                    flexGrow: 1,
                    flexBasis: 270,
                    backgroundColor: pressed ? colors.soft : colors.paper,
                    borderWidth: 1,
                    borderColor: colors.line,
                    borderRadius: 18,
                    padding: 20,
                    gap: 12,
                  })}
                >
                  <View
                    style={[styles.row, { justifyContent: "space-between" }]}
                  >
                    <Text style={[styles.heading, { fontSize: 19 }]}>
                      {list.label}
                    </Text>
                    <ArrowUpRight size={20} color={colors.green} />
                  </View>
                  <Text style={styles.muted}>{list.summary}</Text>
                  <Text
                    style={[
                      styles.eyebrow,
                      { color: colors.muted, letterSpacing: 1 },
                    ]}
                  >
                    {list.sections.length} sections ·{" "}
                    {list.sections.reduce(
                      (sum, section) => sum + section.items.length,
                      0,
                    )}{" "}
                    items
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}
      {!CHECKLISTS.some((list) =>
        `${list.label} ${list.summary}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ) && (
        <Text style={styles.body}>
          No activities match “{query}”. Try camping, travel, or cycling.
        </Text>
      )}
    </ScrollView>
  );
}
