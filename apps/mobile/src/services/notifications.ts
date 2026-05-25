import { LocalNotifications, ScheduleOptions } from "@capacitor/local-notifications";

/* ── Mapeamento de dias ────────────────────────────────────── */

const DAY_TO_WEEKDAY: Record<string, number> = {
  Dom: 1,
  Seg: 2,
  Ter: 3,
  Qua: 4,
  Qui: 5,
  Sex: 6,
  Sáb: 7,
};

/* ── Permissões ────────────────────────────────────────────── */

export async function requestNotificationPermission(): Promise<boolean> {
  const perm = await LocalNotifications.checkPermissions();
  if (perm.display === "granted") return true;

  const req = await LocalNotifications.requestPermissions();
  return req.display === "granted";
}

/* ── Agendar notificações para um lembrete ─────────────────── */

/**
 * Para cada dia selecionado, cria uma notificação agendada que repete
 * semanalmente no horário definido.
 *
 * IDs são gerados a partir do ID do lembrete + índice do dia,
 * para poder cancelar individualmente depois.
 */
export async function scheduleReminder(reminder: {
  id: number;
  time: string; // "HH:mm"
  label: string;
  days: string[];
}) {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const [hours, minutes] = reminder.time.split(":").map(Number);

  const notifications: ScheduleOptions["notifications"] = reminder.days.map(
    (day, idx) => {
      const notifId = reminder.id * 10 + idx; // ex: lembrete 3, dia 0 → id 30

      return {
        id: notifId,
        title: "Dyna Tech — Lembrete",
        body: `⏰ ${reminder.time} — ${reminder.label}`,
        schedule: {
          on: {
            weekday: DAY_TO_WEEKDAY[day],
            hour: hours,
            minute: minutes,
          },
          allowWhileIdle: true,
        },
        sound: "default",
        smallIcon: "ic_launcher",
        autoCancel: true,
      };
    }
  );

  await LocalNotifications.schedule({ notifications });
}

/* ── Cancelar todas as notificações de um lembrete ─────────── */

export async function cancelReminder(reminderId: number, daysCount: number) {
  const ids = Array.from({ length: daysCount }, (_, i) => ({
    id: reminderId * 10 + i,
  }));

  await LocalNotifications.cancel({ notifications: ids });
}

/* ── Cancelar TODAS as notificações pendentes ──────────────── */

export async function cancelAllReminders() {
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length > 0) {
    await LocalNotifications.cancel({
      notifications: pending.notifications.map((n) => ({ id: n.id })),
    });
  }
}
