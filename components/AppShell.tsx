"use client";

import { useMemo, useState, type ReactElement } from "react";
import type { ScreenKey } from "@/components/navigation/types";
import { BottomNav } from "@/components/navigation/BottomNav";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { SearchScreen } from "@/components/screens/SearchScreen";
import { ResultsScreen } from "@/components/screens/ResultsScreen";
import { StudentProfileScreen } from "@/components/screens/StudentProfileScreen";
import { BookingScreen } from "@/components/screens/BookingScreen";
import { AgendaScreen } from "@/components/screens/AgendaScreen";
import { MessagesScreen } from "@/components/screens/MessagesScreen";
import { ClinicalHistoryScreen } from "@/components/screens/ClinicalHistoryScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";

export function AppShell() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("home");

  const screen = useMemo(() => {
    const go = setActiveScreen;
    const screens: Record<ScreenKey, ReactElement> = {
      home: <HomeScreen onNavigate={go} />,
      search: <SearchScreen onNavigate={go} />,
      results: <ResultsScreen onNavigate={go} />,
      student: <StudentProfileScreen onNavigate={go} />,
      booking: <BookingScreen onNavigate={go} />,
      agenda: <AgendaScreen onNavigate={go} />,
      messages: <MessagesScreen onNavigate={go} />,
      history: <ClinicalHistoryScreen onNavigate={go} />,
      profile: <ProfileScreen onNavigate={go} />
    };

    return screens[activeScreen];
  }, [activeScreen]);

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(168,85,247,0.18),transparent)]" />
      {screen}
      <BottomNav active={activeScreen} onNavigate={setActiveScreen} />
    </main>
  );
}
