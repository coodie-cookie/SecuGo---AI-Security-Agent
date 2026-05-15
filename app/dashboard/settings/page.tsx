"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  ExternalLink,
  Github,
  Info,
  LogOut,
  ScanLine,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";

const PREFS_KEY = "secugo_prefs";

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}");
  } catch { return {}; }
}
function savePrefs(p: object) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch {}
}

export default function SettingsPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  const [prefs, setPrefs] = useState({
    autoScan: false,
    emailCritical: false,
    weeklySummary: false,
  });

  useEffect(() => {
    const saved = loadPrefs();
    setPrefs({
      autoScan: saved.autoScan ?? false,
      emailCritical: saved.emailCritical ?? false,
      weeklySummary: saved.weeklySummary ?? false,
    });
  }, []);

  const togglePref = (key: keyof typeof prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    savePrefs(next);
  };

  const signOut = async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    // clear demo cookie
    document.cookie = "secugo_demo_session=; max-age=0; path=/";
    router.push("/login");
  };

  return (
    <div className="space-y-7 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-white/50">
          Manage your account, integrations, and notifications
        </p>
      </motion.div>

      {/* Profile */}
      <Section title="Profile">
        {loading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
              <AvatarFallback className="text-lg">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-base font-medium">{user?.name}</div>
              <div className="text-sm text-white/45">{user?.email}</div>
              {user?.username && (
                <div className="text-xs text-white/35 mt-0.5">
                  @{user.username}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="mt-5 grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/45">Display name</label>
            <Input
              className="mt-1.5"
              value={loading ? "" : (user?.name ?? "")}
              readOnly
              placeholder="Loading..."
            />
          </div>
          <div>
            <label className="text-xs text-white/45">Email</label>
            <Input
              className="mt-1.5"
              value={loading ? "" : (user?.email ?? "")}
              readOnly
              placeholder="Loading..."
            />
          </div>
        </div>
      </Section>

      {/* Integrations */}
      <Section title="Integrations">
        {loading ? (
          <Skeleton className="h-16 rounded-xl" />
        ) : (
          <Row
            icon={Github}
            title="GitHub"
            subtitle={
              user?.username
                ? `Connected as @${user.username} · ${user.repoCount} repositor${user.repoCount === 1 ? "y" : "ies"} indexed`
                : "Connected via GitHub OAuth"
            }
            status="connected"
            right={
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a
                  href={`https://github.com/settings/connections/applications`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Manage
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            }
          />
        )}

        {/* AI engine info — no key needed since it's server-side */}
        <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 mt-2">
          <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
            <Info className="h-4 w-4 text-white/55" />
          </div>
          <div>
            <div className="text-sm font-medium flex items-center gap-2">
              Gemini AI
              <span className="inline-flex items-center gap-1 text-[11px] text-lime-300">
                <CheckCircle2 className="h-3 w-3" />
                Active
              </span>
            </div>
            <div className="text-xs text-white/45 mt-0.5">
              Powering AI explanations and the security assistant. No setup needed.
            </div>
          </div>
        </div>
      </Section>

      {/* Scan preferences */}
      <Section title="Scan preferences">
        <Toggle
          icon={ScanLine}
          title="Auto-scan on every push"
          subtitle="Run a fresh scan whenever new commits land on the default branch"
          enabled={prefs.autoScan}
          onToggle={() => togglePref("autoScan")}
        />
        <Toggle
          icon={Bell}
          title="Email me on critical findings"
          subtitle={
            prefs.emailCritical
              ? `Alerts will be sent to ${user?.email ?? "your email"}`
              : "Get notified when a scan finds critical issues"
          }
          enabled={prefs.emailCritical}
          onToggle={() => togglePref("emailCritical")}
        />
        <Toggle
          icon={Bell}
          title="Weekly security digest"
          subtitle="A short summary of changes across all your repos, every Monday"
          enabled={prefs.weeklySummary}
          onToggle={() => togglePref("weeklySummary")}
        />

        {/* Email info callout */}
        {(prefs.emailCritical || prefs.weeklySummary) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 rounded-xl border border-lime-400/15 bg-lime-400/[0.04] p-4"
          >
            <Info className="h-4 w-4 text-lime-300 shrink-0 mt-0.5" />
            <p className="text-xs text-white/65 leading-relaxed">
              Emails will be sent to{" "}
              <span className="text-white font-medium">{user?.email}</span>.
              Notifications fire automatically after each completed scan.
            </p>
          </motion.div>
        )}
      </Section>

      {/* Danger zone */}
      <Section title="Danger zone" tone="danger">
        <Row
          icon={LogOut}
          title="Sign out"
          subtitle="End your current session on this device"
          right={
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign out
            </Button>
          }
        />
        <Row
          icon={Trash2}
          title="Delete account"
          subtitle="Permanently remove all your data — this can't be undone"
          right={
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          }
        />
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
  tone,
}: {
  title: string;
  children: React.ReactNode;
  tone?: "danger";
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl border bg-white/[0.02] backdrop-blur-sm p-6 space-y-4 ${
        tone === "danger" ? "border-red-500/15" : "border-white/[0.06]"
      }`}
    >
      <h2
        className={`text-sm uppercase tracking-wider ${
          tone === "danger" ? "text-red-300/80" : "text-white/40"
        }`}
      >
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

function Row({
  icon: Icon,
  title,
  subtitle,
  right,
  status,
}: {
  icon: any;
  title: string;
  subtitle: string;
  right: React.ReactNode;
  status?: "connected";
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0">
      <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-white/65" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium">
          {title}
          {status === "connected" && (
            <span className="inline-flex items-center gap-1 text-[11px] text-lime-300">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </span>
          )}
        </div>
        <div className="text-xs text-white/45 mt-0.5">{subtitle}</div>
      </div>
      {right}
    </div>
  );
}

function Toggle({
  icon: Icon,
  title,
  subtitle,
  enabled,
  onToggle,
}: {
  icon: any;
  title: string;
  subtitle: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0">
      <div className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-white/65" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-white/45 mt-0.5">{subtitle}</div>
      </div>
      <button
        onClick={onToggle}
        className={`relative h-6 w-10 rounded-full transition-all ${
          enabled
            ? "bg-lime-400 shadow-[0_0_14px_rgba(107,249,0,0.5)]"
            : "bg-white/[0.08]"
        }`}
        aria-pressed={enabled}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
