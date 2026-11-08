import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courtsAPI, bookingsAPI } from '../../api/client';
import styles from './BookingFlowPage.module.css';

const PRICE_PER_HR = 2500;
const DEPOSIT = 500;

// ── Helpers ──────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0'); }
function formatHr(h) {
  const hr = Math.floor(h);
  const min = (h % 1 === 0.5) ? '30' : '00';
  return `${pad(hr)}:${min}`;
}
function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

// ── Build calendar days for a given month ────────────
function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

// ── Flow step indicator ───────────────────────────────
function FlowSteps({ step }) {
  const steps = ['Select Court', 'Date & Duration', 'Payment', 'Confirmed'];
  return (
    <div className={styles.flowRow}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <div className={`${styles.flowStep} ${i < step ? styles.stepDone : i === step ? styles.stepActive : ''}`}>
            {i < step && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
            {s}
          </div>
          {i < steps.length - 1 && <span className={styles.arrow}>→</span>}
        </div>
      ))}
    </div>
  );
}

export default function BookingFlowPage() {
  const { courtId } = useParams();
  const navigate = useNavigate();

  const [court, setCourt]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots]   = useState([]);

  // Calendar state
  const today = new Date();
  const [calYear, setCalYear]   = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  // Duration stepper (units of 0.5hr, min 2 = 1hr)
  const [durUnits, setDurUnits] = useState(2);
  const [startHr,  setStartHr]  = useState(null);

  // Payment
  const [payMethod, setPayMethod] = useState('online');

  // Countdown timer
  const [timerSec, setTimerSec] = useState(587);
  const timerRef = useRef(null);

  // Submission
  const [confirming, setConfirming] = useState(false);

  // Load court
  useEffect(() => {
    if (!courtId) { setLoading(false); return; }
    courtsAPI.get(courtId)
      .then(r => setCourt(r.data.court || r.data))
      .catch(() => setCourt({ id: courtId, name: 'Elite Futsal Arena', location: 'Colombo 7', price_per_hour: 2500 }))
      .finally(() => setLoading(false));
  }, [courtId]);

  // Load slots when date changes
  useEffect(() => {
    if (!selectedDate || !courtId) return;
    const dateStr = selectedDate.toISOString().slice(0, 10);
    courtsAPI.getSlots(courtId, dateStr)
      .then(r => setSlots(r.data.slots || r.data || []))
      .catch(() => setSlots([]));
  }, [selectedDate, courtId]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimerSec(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const calCells = buildCalendar(calYear, calMonth);

  const totalHrs  = durUnits / 2;
  const endHr     = startHr != null ? startHr + totalHrs : null;
  const pricePerHr = Number(court?.price_per_hour || PRICE_PER_HR);
  const total      = Math.round(totalHrs * pricePerHr);
  const balance    = total - DEPOSIT;

  const timerMin = Math.floor(timerSec / 60);
  const timerSecs = timerSec % 60;

  // All hours 6-22
  const allHours = Array.from({ length: 17 }, (_, i) => i + 6);

  // Which hours are taken
  const takenHours = new Set(
    slots.filter(s => s.is_booked || s.is_blocked).map(s => parseInt(s.start_time))
  );

  const handleConfirm = async () => {
    if (!selectedDate || startHr == null) {
      alert('Please select a date and start time.');
      return;
    }
    setConfirming(true);
    try {
      const dateStr = selectedDate.toISOString().slice(0, 10);
      const { data } = await bookingsAPI.create({
        court_id: courtId,
        date: dateStr,
        start_time: formatHr(startHr),
        end_time: formatHr(endHr),
        duration_hours: totalHrs,
        total_price: total,
        deposit_amount: DEPOSIT,
        payment_method: payMethod,
      });
      const bookingId = data.booking?.id || data.id || 'new';
      navigate(`/booking-confirmed/${bookingId}`);
    } catch (e) {
      alert(e.response?.data?.error || 'Could not confirm booking. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading court…</div>;

  const selectedDateStr = selectedDate
    ? selectedDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })
    : '—';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Book a Slot</h1>
        <p className={styles.subtitle}>{court?.name || 'Court'} · {court?.location || 'Colombo'} · LKR {pricePerHr.toLocaleString()}/hr</p>
      </div>

      <FlowSteps step={1} />

      <div className={styles.layout}>
        {/* Left column */}
        <div>
          {/* Calendar */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Select Date</div>
              <div className={styles.calNav}>
                <button className={styles.navBtn} onClick={() => {
                  const d = addMonths(new Date(calYear, calMonth), -1);
                  setCalYear(d.getFullYear()); setCalMonth(d.getMonth());
                }}>‹</button>
                <span className={styles.monthLabel}>{MONTH_NAMES[calMonth]} {calYear}</span>
                <button className={styles.navBtn} onClick={() => {
                  const d = addMonths(new Date(calYear, calMonth), 1);
                  setCalYear(d.getFullYear()); setCalMonth(d.getMonth());
                }}>›</button>
              </div>
            </div>

            <div className={styles.calGrid}>
              {DAY_NAMES.map(d => <div key={d} className={styles.calDayLabel}>{d}</div>)}
              {calCells.map((d, i) => {
                if (!d) return <div key={`blank-${i}`} />;
                const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const isToday = sameDay(d, today);
                const isSelected = selectedDate && sameDay(d, selectedDate);
                return (
                  <div
                    key={d.getTime()}
                    onClick={() => !isPast && setSelectedDate(d)}
                    className={`${styles.calDay}
                      ${isPast ? styles.calPast : ''}
                      ${isToday && !isSelected ? styles.calToday : ''}
                      ${isSelected ? styles.calSelected : ''}
                    `}
                  >
                    {d.getDate()}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Duration stepper */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Duration</div>
              <span className={styles.hint}>Minimum 1 hour · 30 min increments</span>
            </div>
            <div className={styles.stepper}>
              <button className={styles.stepBtn} onClick={() => setDurUnits(u => Math.max(2, u - 1))} disabled={durUnits <= 2}>−</button>
              <div className={styles.stepDisplay}>
                <span className={styles.stepVal}>{Math.floor(durUnits / 2)}</span>
                <span className={styles.stepUnit}>hr{durUnits >= 4 ? 's' : ''}{durUnits % 2 === 1 ? ' 30m' : ''}</span>
              </div>
              <button className={styles.stepBtn} onClick={() => setDurUnits(u => u + 1)}>+</button>
            </div>
            {startHr != null && (
              <div className={styles.stepSummary}>
                Booking: <strong className={styles.mono}>{formatHr(startHr)} – {formatHr(endHr)}</strong>
                &nbsp;·&nbsp; Total: <strong className={styles.accentMono}>LKR {total.toLocaleString()}</strong>
              </div>
            )}
          </div>

          {/* Time slots */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Start Time{selectedDate ? ` — ${selectedDateStr}` : ''}</div>
              <span className={styles.hint}>Click to set start</span>
            </div>
            <div className={styles.timeSlotsGrid}>
              {allHours.map(hr => {
                const taken = takenHours.has(hr);
                const isStart = startHr === hr;
                const isEnd   = endHr != null && endHr === hr;
                const inRange = startHr != null && endHr != null && hr > startHr && hr < endHr;
                return (
                  <div
                    key={hr}
                    onClick={() => !taken && setStartHr(hr)}
                    className={`${styles.slot}
                      ${taken ? styles.slotTaken : ''}
                      ${isStart ? styles.slotStart : ''}
                      ${isEnd   ? styles.slotEnd   : ''}
                      ${inRange ? styles.slotRange  : ''}
                    `}
                  >
                    {pad(hr)}:00
                  </div>
                );
              })}
            </div>
            <div className={styles.legend}>
              <span><span className={styles.legendDot} style={{ background: 'var(--g-800)' }} />Start</span>
              <span><span className={styles.legendDot} style={{ background: 'var(--g-600)' }} />End</span>
              <span><span className={styles.legendDot} style={{ background: 'var(--accent-glow)', border: '1px solid var(--border-strong)' }} />In range</span>
              <span style={{ color: 'var(--text-muted)' }}><span className={styles.legendDot} style={{ background: 'var(--surface-3)', opacity: 0.4 }} />Taken</span>
            </div>
          </div>
        </div>

        {/* Booking summary sidebar */}
        <div className={styles.summary}>
          <div className={styles.summaryHeader}>
            <div className={styles.cardTitle}>Booking Summary</div>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Court</span>
            <span className={styles.summaryVal}>{court?.name || '—'}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Date</span>
            <span className={styles.summaryVal}>{selectedDate ? selectedDateStr : '—'}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Start</span>
            <span className={`${styles.summaryVal} ${styles.mono}`}>{startHr != null ? formatHr(startHr) : '—'}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Duration</span>
            <span className={styles.summaryVal}>{totalHrs === 1 ? '1 hr' : `${totalHrs} hrs`}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>End</span>
            <span className={`${styles.summaryVal} ${styles.mono}`}>{endHr != null && startHr != null ? formatHr(endHr) : '—'}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Rate</span>
            <span className={styles.summaryPrice}>LKR {pricePerHr.toLocaleString()}/hr</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Total</span>
            <span className={styles.summaryPrice}>LKR {total.toLocaleString()}</span>
          </div>

          <div className={styles.sectionLabel}>Payment Method</div>
          <div className={styles.payOpts}>
            <div className={`${styles.payOpt} ${payMethod === 'online' ? styles.payOptSelected : ''}`} onClick={() => setPayMethod('online')}>
              <div className={styles.payIcon}>💳</div>
              <div className={styles.payLabel}>Online (Stripe)</div>
            </div>
            <div className={`${styles.payOpt} ${payMethod === 'cash' ? styles.payOptSelected : ''}`} onClick={() => setPayMethod('cash')}>
              <div className={styles.payIcon}>💵</div>
              <div className={styles.payLabel}>Cash at Venue</div>
            </div>
          </div>

          <div className={styles.depositNotice}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            A deposit of <strong>LKR {DEPOSIT.toLocaleString()}</strong> is required to secure your slot.
          </div>

          <div className={styles.depositBreak}>
            <span>Deposit now</span>
            <span className={styles.accentMono}>LKR {DEPOSIT.toLocaleString()}</span>
          </div>
          <div className={styles.depositBreak}>
            <span>Balance at venue</span>
            <span className={styles.mutedMono}>LKR {Math.max(0, balance).toLocaleString()}</span>
          </div>

          <div className={styles.timerBar}>
            <span>Payment window</span>
            <span className={`${styles.timerVal} ${timerSec === 0 ? styles.timerExpired : ''}`}>
              {pad(timerMin)}:{pad(timerSecs)}
            </span>
          </div>

          <button className={styles.confirmBtn} onClick={handleConfirm} disabled={confirming || !selectedDate || startHr == null}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}><polyline points="20 6 9 17 4 12"/></svg>
            {confirming ? 'Confirming…' : `Confirm & Pay LKR ${DEPOSIT.toLocaleString()}`}
          </button>
          <div className={styles.cancelPolicy}>Free cancellation up to 24 hrs before slot</div>
        </div>
      </div>
    </div>
  );
}
