"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, Mail, Smartphone } from "lucide-react";

interface NotificationSettings {
  enabled: boolean;
  email: boolean;
  push: boolean;
  reminders: {
    "24h": boolean;
    "12h": boolean;
    "6h": boolean;
    "1h": boolean;
  };
}

interface NotificationSettingsProps {
  sailingId: string;
  deadlineId?: string;
}

const STORAGE_KEY = "sprutnet_notification_settings";

export function NotificationSettings({
  sailingId,
  deadlineId,
}: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    email: false,
    push: false,
    reminders: {
      "24h": true,
      "12h": false,
      "6h": false,
      "1h": false,
    },
  });

  // Загружаем настройки из localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const allSettings = JSON.parse(stored);
          const key = deadlineId ? `${sailingId}_${deadlineId}` : sailingId;
          if (allSettings[key]) {
            setSettings(allSettings[key]);
          }
        }
      } catch (error) {
        console.error("Error loading notification settings:", error);
      }
    }
  }, [sailingId, deadlineId]);

  // Сохраняем настройки в localStorage и API
  const saveSettings = async (newSettings: NotificationSettings) => {
    if (typeof window !== "undefined") {
      try {
        // Сохраняем в localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        const allSettings = stored ? JSON.parse(stored) : {};
        const key = deadlineId ? `${sailingId}_${deadlineId}` : sailingId;

        allSettings[key] = newSettings;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));

        console.log("💾 Notification settings saved to localStorage:", {
          key,
          settings: newSettings,
        });

        // Сохраняем в API
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "save_settings",
            sailingId,
            deadlineId,
            settings: newSettings,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("💾 Notification settings saved to API:", result);
        } else {
          console.error("❌ Failed to save settings to API");
        }
      } catch (error) {
        console.error("Error saving notification settings:", error);
      }
    }
  };

  const handleSettingChange = async (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleReminderChange = async (
    reminderKey: keyof NotificationSettings["reminders"],
    value: boolean
  ) => {
    const newSettings = {
      ...settings,
      reminders: {
        ...settings.reminders,
        [reminderKey]: value,
      },
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const getActiveRemindersCount = () => {
    return Object.values(settings.reminders).filter(Boolean).length;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5" />
          Настройки уведомлений
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Основной переключатель */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label
              htmlFor="notifications-enabled"
              className="text-base font-medium"
            >
              Включить уведомления
            </Label>
            <p className="text-sm text-muted-foreground">
              Получать напоминания о важных дедлайнах
            </p>
          </div>
          <Switch
            id="notifications-enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) =>
              handleSettingChange("enabled", checked)
            }
          />
        </div>

        {settings.enabled && (
          <>
            {/* Каналы уведомлений */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Каналы уведомлений</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-notifications"
                    checked={settings.email}
                    onCheckedChange={(checked) =>
                      handleSettingChange("email", checked === true)
                    }
                  />
                  <Label
                    htmlFor="email-notifications"
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email уведомления
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="push-notifications"
                    checked={settings.push}
                    onCheckedChange={(checked) =>
                      handleSettingChange("push", checked === true)
                    }
                  />
                  <Label
                    htmlFor="push-notifications"
                    className="flex items-center gap-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    Push уведомления
                  </Label>
                </div>
              </div>
            </div>

            {/* Время напоминаний */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Время напоминаний</Label>
                <Badge variant="secondary">
                  {getActiveRemindersCount()} активных
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reminder-24h"
                    checked={settings.reminders["24h"]}
                    onCheckedChange={(checked) =>
                      handleReminderChange("24h", checked === true)
                    }
                  />
                  <Label
                    htmlFor="reminder-24h"
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    За 24 часа
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reminder-12h"
                    checked={settings.reminders["12h"]}
                    onCheckedChange={(checked) =>
                      handleReminderChange("12h", checked === true)
                    }
                  />
                  <Label
                    htmlFor="reminder-12h"
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    За 12 часов
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reminder-6h"
                    checked={settings.reminders["6h"]}
                    onCheckedChange={(checked) =>
                      handleReminderChange("6h", checked === true)
                    }
                  />
                  <Label
                    htmlFor="reminder-6h"
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    За 6 часов
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reminder-1h"
                    checked={settings.reminders["1h"]}
                    onCheckedChange={(checked) =>
                      handleReminderChange("1h", checked === true)
                    }
                  />
                  <Label
                    htmlFor="reminder-1h"
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    За 1 час
                  </Label>
                </div>
              </div>
            </div>

            {/* Статус */}
            <div className="rounded-lg bg-muted p-3">
              <div className="flex items-center gap-2 text-sm">
                <Bell className="h-4 w-4 text-primary" />
                <span className="font-medium">Уведомления активны</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {settings.email && settings.push
                  ? "Email и Push уведомления"
                  : settings.email
                    ? "Email уведомления"
                    : settings.push
                      ? "Push уведомления"
                      : "Каналы не выбраны"}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
