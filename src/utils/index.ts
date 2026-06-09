export const formatTime = (timeStr: string): string => {
  const date = new Date(timeStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

export const formatNumber = (num: number): string => {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}w`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return String(num);
};

export const formatDateTime = (timeStr: string): string => {
  const date = new Date(timeStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hour}:${minute}`;
};

export const formatDateShort = (timeStr: string): string => {
  const date = new Date(timeStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hour}:${minute}`;
};

export const getCategoryColor = (category: string): { bg: string; text: string } => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    idle: { bg: '#FFF7E6', text: '#FF7D00' },
    carpool: { bg: '#E8F3FF', text: '#165DFF' },
    repair: { bg: '#FFECE8', text: '#F53F3F' },
    find: { bg: '#E8FFEA', text: '#00B42A' },
    help: { bg: '#F5F0FF', text: '#722ED1' },
    activity: { bg: '#FFF0E6', text: '#FF9500' },
    notice: { bg: '#E6F4FF', text: '#0FC6C2' },
    other: { bg: '#F2F3F5', text: '#4E5969' }
  };
  return colorMap[category] || colorMap.other;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};
