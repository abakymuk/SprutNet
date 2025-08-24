import { NextResponse } from 'next/server';

// Mock функция для отправки email уведомлений
async function sendEmailNotification(email: string, subject: string, message: string) {
  console.log('📧 Email notification:', { email, subject, message });
  // В реальном проекте здесь будет интеграция с SendGrid или другим сервисом
  return { success: true, messageId: `email_${Date.now()}` };
}

// Mock функция для отправки push уведомлений
async function sendPushNotification(userId: string, title: string, message: string) {
  console.log('📱 Push notification:', { userId, title, message });
  // В реальном проекте здесь будет интеграция с OneSignal или другим сервисом
  return { success: true, messageId: `push_${Date.now()}` };
}

// Функция для проверки, нужно ли отправить уведомление
function shouldSendNotification(deadlineDate: string, reminderTimeStr: string): boolean {
  const now = new Date();
  const deadline = new Date(deadlineDate);
  const reminderHours = parseInt(reminderTimeStr.replace('h', ''));
  const reminderDateTime = new Date(deadline.getTime() - reminderHours * 60 * 60 * 1000);
  
  // Проверяем, что текущее время близко к времени напоминания (в пределах 5 минут)
  const diffMinutes = Math.abs((now.getTime() - reminderDateTime.getTime()) / (1000 * 60));
  return diffMinutes <= 5;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, sailingId, deadlineId, settings, deadline } = body;

    console.log('🔔 Notification API called:', { action, sailingId, deadlineId });

    switch (action) {
      case 'save_settings':
        // В реальном проекте здесь будет сохранение в базу данных
        console.log('💾 Saving notification settings:', settings);
        return NextResponse.json({
          success: true,
          message: 'Настройки уведомлений сохранены'
        });

      case 'send_reminder':
        if (!deadline) {
          return NextResponse.json(
            { error: 'Дедлайн не указан' },
            { status: 400 }
          );
        }

        const { email, push, reminders } = settings;
        const sentNotifications = [];

        // Проверяем каждый тип напоминания
        for (const [reminderTimeKey, enabled] of Object.entries(reminders)) {
          if (enabled && shouldSendNotification(deadline.deadlineLocal, reminderTimeKey)) {
            const subject = `Напоминание: ${deadline.name}`;
            const message = `Дедлайн "${deadline.name}" наступит через ${reminderTimeKey}. ${deadline.description}`;

            // Отправляем email уведомления
            if (email) {
              try {
                const emailResult = await sendEmailNotification(
                  'user@example.com', // В реальном проекте будет email пользователя
                  subject,
                  message
                );
                sentNotifications.push({
                  type: 'email',
                  success: emailResult.success,
                  messageId: emailResult.messageId
                });
              } catch (error) {
                console.error('❌ Email notification error:', error);
                sentNotifications.push({
                  type: 'email',
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error'
                });
              }
            }

            // Отправляем push уведомления
            if (push) {
              try {
                const pushResult = await sendPushNotification(
                  'user123', // В реальном проекте будет ID пользователя
                  subject,
                  message
                );
                sentNotifications.push({
                  type: 'push',
                  success: pushResult.success,
                  messageId: pushResult.messageId
                });
              } catch (error) {
                console.error('❌ Push notification error:', error);
                sentNotifications.push({
                  type: 'push',
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error'
                });
              }
            }
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Уведомления обработаны',
          sentNotifications
        });

      default:
        return NextResponse.json(
          { error: 'Неизвестное действие' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Notification API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обработке уведомлений' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sailingId = searchParams.get('sailingId');
    const deadlineId = searchParams.get('deadlineId');

    console.log('🔔 Getting notification settings:', { sailingId, deadlineId });

    // В реальном проекте здесь будет получение настроек из базы данных
    // Пока возвращаем mock данные
    const mockSettings = {
      enabled: true,
      email: true,
      push: false,
      reminders: {
        "24h": true,
        "12h": false,
        "6h": false,
        "1h": false,
      }
    };

    return NextResponse.json({
      success: true,
      settings: mockSettings
    });

  } catch (error) {
    console.error('❌ Error getting notification settings:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении настроек уведомлений' },
      { status: 500 }
    );
  }
}
