export function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return Promise.resolve(false);
  }
  if (Notification.permission === 'granted') {
    return Promise.resolve(true);
  }
  return Notification.requestPermission().then((permission) => {
    return permission === 'granted';
  });
}

export function triggerLocalNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.svg',
    });
  } else {
    console.log(`[Notification Fallback]: ${title} - ${body}`);
  }
}
