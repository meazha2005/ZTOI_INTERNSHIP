export const getISTParts = (ms: number) => {
    const d = new Date(ms);
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
    });
    const parts = formatter.formatToParts(d);
    const p: Record<string, string> = {};
    for (const part of parts) {
        p[part.type] = part.value;
    }
    return {
        year: parseInt(p.year, 10),
        month: parseInt(p.month, 10) - 1, // 0-indexed for JS consistency
        day: parseInt(p.day, 10),
        hour: parseInt(p.hour, 10) === 24 ? 0 : parseInt(p.hour, 10),
        minute: parseInt(p.minute, 10),
        second: parseInt(p.second, 10)
    };
};

export const formatDateWithTime = (ms: number) => {
    if (!ms) return null;
    const parts = getISTParts(ms);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${months[parts.month]} ${pad(parts.day)}, ${parts.year} ${pad(parts.hour)}:${pad(parts.minute)}`;
};

export const formatShortDate = (ms: number) => {
    if (!ms) return null;
    const parts = getISTParts(ms);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${months[parts.month]} ${pad(parts.day)}, ${parts.year}`;
};

export const formatLongDate = (ms: number) => {
    if (!ms) return null;
    const parts = getISTParts(ms);
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(parts.day)} ${months[parts.month]} ${parts.year}`;
};
