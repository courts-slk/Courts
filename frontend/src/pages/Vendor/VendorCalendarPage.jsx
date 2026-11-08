import { useState, useEffect } from 'react';
import { vendorAPI, courtsAPI } from '../../api/client';
import styles from './VendorCalendarPage.module.css';

function pad(n) { return String(n).padStart(2, '0'); }

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

function sameDay(a, b) {
  return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}

export default function VendorCalendarPage() {
  const today = new Date();
  const [calYear, setCalYear]   = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);

  const [courts, setCourts]   = useState([]);
  const [courtId, setCourtId] = useState('');
  const [slots, setSlots]     = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    vendorAPI.getCourts()
      .then(r => {
        const list = r.data.courts || r.data || [];
        setCourts(list);
        if (list.length > 0) setCourtId(list[0].id);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!courtId || !selectedDate) return;
    setLoadingSlots(true);
    const dateStr = selectedDate.toISOString().slice(0, 10);
    vendorAPI.getSlots(courtId, dateStr)
      .then(r => setSlots(r.data.slots || r.data || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [courtId, selectedDate]);

  const allHours = Array.from({ length: 17 }, (_, i) => i + 6);

  const slotMap = {};
  slots.forEach(s => {
    const hr = parseInt(s.start_time);
    slotMap[hr] = s;
  });

  const handleToggleBlock = async (hr) => {
    const slot = slotMap[hr];
    if (!slot) return;
    try {
      await vendorAPI.blockSlot(slot.id, { is_blocked: !slot.is_blocked });
      setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, is_blocked: !s.is_blocked } : s));
    } catch {
      alert('Could not update slot.');
    }
  };

  const handleGenerate = async () => {
    if (!courtId || !selectedDate) return;
    setGenerating(true);
    try {
      const dateStr = selectedDate.toISOString().slice(0, 10);
      for (let hr = 6; hr <= 22; hr++) {
        await courtsAPI.createSlots(courtId, {
          date: dateStr,
          start_time: `${pad(hr)}:00`,
          end_time: `${pad(hr + 1)}:00`,
        });
      }
      // Reload
      const r = await vendorAPI.getSlots(courtId, dateStr);
      setSlots(r.data.slots || r.data || []);
      alert('Slots generated successfully!');
    } catch {
      alert('Could not generate slots. They may already exist.');
    } finally {
      setGenerating(false);
    }
  };

  const calCells = buildCalendar(calYear, calMonth);
  const bookedCount = slots.filter(s => s.is_booked).length;
  const blockedCount = slots.filter(s => s.is_blocked).length;
  const availCount  = slots.length - bookedCount - blockedCount;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Availability Calendar</h1>
        <p className={styles.subtitle}>Manage your court's time slots</p>
      </div>

      {/* Court selector */}
      {courts.length > 1 && (
        <div className={styles.courtSelect}>
          <label className={styles.formLabel}>Court</label>
          <select className={styles.select} value={courtId} onChange={e => setCourtId(e.target.value)}>
            {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      <div className={styles.twoCol}>
        {/* Calendar */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>{MONTH_NAMES[calMonth]} {calYear}</div>
            <div style={{ display:'flex', gap: 6 }}>
              <button className={styles.navBtn} onClick={() => {
                const d = new Date(calYear, calMonth - 1);
                setCalYear(d.getFullYear()); setCalMonth(d.getMonth());
              }}>‹</button>
              <button className={styles.navBtn} onClick={() => {
                const d = new Date(calYear, calMonth + 1);
                setCalYear(d.getFullYear()); setCalMonth(d.getMonth());
              }}>›</button>
              <button className={styles.generateBtn} onClick={handleGenerate} disabled={generating}>
                {generating ? 'Generating…' : '+ Generate Slots'}
              </button>
            </div>
          </div>

          <div className={styles.calGrid}>
            {DAY_NAMES.map(d => <div key={d} className={styles.calDayLabel}>{d}</div>)}
            {calCells.map((d, i) => {
              if (!d) return <div key={`blank-${i}`} />;
              const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const isToday = sameDay(d, today);
              const isSel   = sameDay(d, selectedDate);
              return (
                <div
                  key={d.getTime()}
                  onClick={() => !isPast && setSelectedDate(d)}
                  className={`${styles.calDay} ${isPast ? styles.calPast : ''} ${isToday && !isSel ? styles.calToday : ''} ${isSel ? styles.calSelected : ''}`}
                >
                  {d.getDate()}
                </div>
              );
            })}
          </div>
        </div>

        {/* Slot overview */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              {selectedDate?.toLocaleDateString('en-GB', { day:'numeric', month:'long' })} — Slot Overview
            </div>
          </div>

          {loadingSlots && <div className={styles.empty}>Loading slots…</div>}

          {!loadingSlots && (
            <>
              <div className={styles.slotGrid}>
                {allHours.map(hr => {
                  const slot = slotMap[hr];
                  const isBooked  = slot?.is_booked;
                  const isBlocked = slot?.is_blocked;
                  const noSlot    = !slot;
                  return (
                    <div
                      key={hr}
                      className={`${styles.slot}
                        ${isBooked ? styles.slotBooked : ''}
                        ${isBlocked && !isBooked ? styles.slotBlocked : ''}
                        ${noSlot ? styles.slotEmpty : ''}
                      `}
                      onClick={() => !isBooked && !noSlot && handleToggleBlock(hr)}
                      title={isBooked ? 'Booked' : isBlocked ? 'Blocked (click to unblock)' : noSlot ? 'No slot generated' : 'Available (click to block)'}
                    >
                      {pad(hr)}:00
                    </div>
                  );
                })}
              </div>
              <div className={styles.slotLegend}>
                {slots.length > 0 ? `${bookedCount} booked · ${availCount} available · ${blockedCount} blocked` : 'No slots — click "Generate Slots" to create them'}
              </div>
              <div className={styles.legendRow}>
                <span><span className={styles.legendDot} style={{ background: 'var(--g-600)' }} />Available</span>
                <span><span className={styles.legendDot} style={{ background: 'rgba(214,79,79,0.6)' }} />Booked</span>
                <span><span className={styles.legendDot} style={{ background: 'var(--surface-3)' }} />Blocked</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
